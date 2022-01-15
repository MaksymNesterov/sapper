import type { NextPage } from "next";
import Head from "next/head";
import { Cell, GameContainer, Main, MenuBlock } from "styles/styled";
import React, { useEffect, useState } from "react";
import { CellT } from "types/index";
import { Socket } from "socket.io-client";
import {
  getInitialCells,
  winCheck,
  setGameField,
  gameOver,
  renderEmptyIsland,
  cellContent,
  InitSocketConnection,
} from "utils";
import { Stack } from "@mui/material";
import { GetOnlineTokenModal } from "components/GetOnlineTokenModal.tsx";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { StartOnlineGameModal } from "components/StartOnlineGameModal.tsx";

export const RESOLUTION = 16;

const Home: NextPage = () => {
  const [cells, setCells] = useState<CellT[][]>(getInitialCells());
  const [flags, setFlags] = useState<number>(RESOLUTION * 2);
  const [score, setScore] = useState<number>(0);

  const [isGameFinished, setIsGameFinished] = useState(false);
  const [isFirstTurn, setIsFirstTurn] = useState(true);
  const [isMultiPlayer, setIsMultiPlayer] = useState(false);

  const [isOnlineTokenModal, setIsOnlineTokenModal] = useState(false);
  const [isInviteModal, setIsInviteModal] = useState(false);

  const [inviterToken, setInviterToken] = useState('')
  const [gameToken, setGameToken] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [globalSocket, setGlobalSocket] =
    useState<Socket<DefaultEventsMap, DefaultEventsMap>>();

  useEffect(() => {
    const getSocket = async () => {
      const socket = await InitSocketConnection();

      socket.on("invite", (token) => {
        if (!isMultiPlayer) {
          setIsInviteModal(true);
          setInviterToken(token);
        }
      });

      socket.on("gameStart", (roomToken) => {
        setIsMyTurn(true);
        startOnlineGame(roomToken);
      });

      socket.on("first turn", ({cells, gameToken} : {cells: CellT[][], gameToken: string}) => {
        setIsFirstTurn(false);
        setScore(score + 1);
        setIsMyTurn(true);
        setGameToken(gameToken)
        setCells(cells);
      });

      socket.on("game turn", ({cells, score, flags, isGameOver} : {cells: CellT[][], score: number, flags: number, isGameOver?: boolean}) => {
        if (isGameOver) {
          finishOnlineGame(cells)
        } else {
          setCells(cells);
          setScore(score)
          setFlags(flags)
          setIsMyTurn(true);
        }
      });

      setGlobalSocket(socket);
    };

    getSocket();
  }, []);

  useEffect(() => {
    if (winCheck(cells)) {
      setIsGameFinished(true);
      alert("You won");
    }
  }, [cells]);

  const finishOnlineGame = (cells: CellT[][]) => {
    globalSocket?.emit("finish game", {gameToken});

    setIsMultiPlayer(false)
    setCells(gameOver(cells));
    setIsGameFinished(true);
    setScore(0);
    setGameToken('')
    setIsMyTurn(false)
  }

  const startOnlineGame = (token: string) => {
    setGameToken(token);
    setIsMultiPlayer(true);
    setIsInviteModal(false);
    setIsOnlineTokenModal(false);
  };

  const onAccept = () => {
    globalSocket?.emit(
      "accept invite",
      inviterToken,
      ({ token }: { token: string }) => token && startOnlineGame(token)
    );
  };

  const onDecline = () => {
    setGameToken("");
    setIsInviteModal(false);
  };

  const handleConnect = (inputValue: string) => {
    if (globalSocket) {
      globalSocket.emit("connect to player", inputValue);
    }
  };

  const handlePlaceFlag = (
    cell: CellT,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (isFirstTurn) return

    const { x, y, flaged } = cell;
    let newCells = [...cells];
    let newFlags = flags

    if (flaged) {
      newCells[y][x] = { ...newCells[y][x], flaged: false, visible: false };
      newFlags = flags + 1;
    } else if (!flaged && flags > 0) {
      newCells[y][x] = { ...newCells[y][x], flaged: true, visible: true };
      newFlags = flags - 1;
    }

    if (isMultiPlayer) {
      globalSocket?.emit("game turn", {cells: newCells, score, flags: newFlags, gameToken})
      setIsMyTurn(false)
    }

    setFlags(newFlags)
    setCells(newCells);
  };

  const handleClick = (cell: CellT) => {
    if (cell.flaged) {
      return;
    }

    if (isFirstTurn) {
      setCells(setGameField(cell, cells));
      setIsFirstTurn(false);
      setScore(score + 1);
     
      //// mutli
      if (isMultiPlayer) {
        globalSocket?.emit("first turn", {gameToken, cells})
        setIsMyTurn(false)
      }
      return;
    }

    if (cell.content === "bomb") {
      setCells(gameOver(cells));
      setIsGameFinished(true);
      setScore(0);

      //// mutli
      if (isMultiPlayer) {
        globalSocket?.emit("game turn", {cells, score, flags, gameToken, isGameOver: true})
        finishOnlineGame(cells)
      }
      return
    }

    const { x, y, content } = cell;
    let newCells = [...cells];

    if (content === null) {
      newCells = renderEmptyIsland(newCells, y, x);
    } else {
      newCells[y][x] = { ...newCells[y][x], visible: true };
    }

    //// mutli
    if (isMultiPlayer) {
      globalSocket?.emit("game turn", {cells: newCells, gameToken, score: score + 1, flags})
      setIsMyTurn(false);
    }

    setScore(score + 1);
    setCells(newCells);
  };

  const handleRestart = () => {
    setCells(getInitialCells());
    setIsFirstTurn(true);
    setIsGameFinished(false);
    setFlags(RESOLUTION * 2);
    setScore(0);
  };

  return (
    <>
      <Head>
        <title>Sapper</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <MenuBlock>
          {isMyTurn && <h2>Your turn</h2>}
          <h2>Score: {score}</h2>
          <Stack spacing={1}>
            <button onClick={handleRestart}>Restart</button>
            <button
              onClick={() => setIsOnlineTokenModal(true)}
              disabled={isMultiPlayer}
            >
              Play online
            </button>
          </Stack>
          <h2>Flags: {flags}</h2>
        </MenuBlock>

        <GameContainer isGameFinished={isGameFinished} resolution={RESOLUTION}>
          {cells.map((row) =>
            row.map((cell) => (
              <Cell
                visible={cell.visible}
                disabled={cell.visible || (!isMyTurn &&  isMultiPlayer)}
                onClick={() => handleClick(cell)}
                onContextMenu={(event) => handlePlaceFlag(cell, event)}
                key={cell.id}
              >
                {cell.visible && cellContent(cell.content, cell.flaged)}
              </Cell>
            ))
          )}
        </GameContainer>
      </Main>
      {isOnlineTokenModal && (
        <GetOnlineTokenModal
          isOpen={isOnlineTokenModal}
          onClose={setIsOnlineTokenModal}
          handleConnect={handleConnect}
        />
      )}
      {isInviteModal && (
        <StartOnlineGameModal
          isOpen={isInviteModal}
          onClose={setIsInviteModal}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      )}
    </>
  );
};

export default Home;
