import type { NextPage } from "next";
import Head from "next/head";
import { Cell, GameContainer, Main, NumberCell, MenuBlock } from "../styles/styled";
import React, { useEffect, useState } from "react";
import { CellT, NumbersMap } from "../types/index";
import BombIcon from "../assets/bomb.svg";
import FlagIcon from "../assets/flag.svg";

const RESOLUTION = 16;

const LOOK_AROUND_MAP: { [key in number]: number[] } = {
  1: [-1, -1],
  2: [-1, 0],
  3: [-1, 1],
  4: [0, -1],
  5: [0, 1],
  6: [1, -1],
  7: [1, 0],
  8: [1, 1],
};

const NUMBERS_MAP: NumbersMap = {
  1: <NumberCell color="#ff0000">1</NumberCell>,
  2: <NumberCell color="#ffa500">2</NumberCell>,
  3: <NumberCell color="#ffff00">3</NumberCell>,
  4: <NumberCell color="#008000">4</NumberCell>,
  5: <NumberCell color="#0000ff">5</NumberCell>,
  6: <NumberCell color="#4b0082">6</NumberCell>,
  7: <NumberCell color="#ee82ee">7</NumberCell>,
  8: <NumberCell color="black">8</NumberCell>,
};

///////

const getInitialCells = (): CellT[][] => {
  const result: CellT[][] = [[]];
  let count: number = 1;

  for (let i = 0; i < RESOLUTION; i++) {
    result[i] = [];

    for (let j = 0; j < RESOLUTION; j++) {
      result[i][j] = {
        id: count,
        x: j,
        y: i,
        flaged: false,
        visible: false,
        content: null,
      };

      count++;
    }
  }

  return result;
};

const cellContent = (content: null | number | "bomb", flaged?: boolean) => {
  if (flaged) {
    return <FlagIcon />;
  }
  if (content === "bomb") {
    return <BombIcon />;
  }
  if (typeof content === "number") {
    return NUMBERS_MAP[content];
  }
};

const setGameField = (cell: CellT, initialField: CellT[][]) => {
  const result: CellT[][] = [...initialField];
  const cellWithBoms: { [key in number]: boolean } = {};

  let bombsLeft = RESOLUTION * 2;

  while (bombsLeft > 0) {
    const value = Math.floor(Math.random() * (RESOLUTION * RESOLUTION)) + 1;
    if (!cellWithBoms[value] && cell.id !== value) {
      cellWithBoms[value] = true;
      bombsLeft--;
    }
  }

  for (let i = 0; i < RESOLUTION; i++) {
    for (let j = 0; j < RESOLUTION; j++) {
      const currentCell = result[i][j];

      if (currentCell.id === cell.id) {
        result[i][j] = { ...currentCell, visible: true };
      }

      if (cellWithBoms[currentCell.id]) {
        result[i][j] = {
          ...currentCell,
          content: "bomb",
        };

        for (let k = 1; k < 9; k++) {
          const [x, y] = LOOK_AROUND_MAP[k];

          if (
            i + x >= 0 &&
            j + y >= 0 &&
            i + x <= RESOLUTION - 1 &&
            j + y <= RESOLUTION - 1
          ) {
            const { content } = result[i + x][j + y];
            if (content !== "bomb") {
              result[i + x][j + y] = {
                ...result[i + x][j + y],
                content: content !== null ? content + 1 : 1,
              };
            }
          }
        }

        cellWithBoms[currentCell.id] = false;
      }
    }
  }

  if(result[cell.y][cell.x].content === null) {
    return renderEmptyIsland(result, cell.y, cell.x)
  }

  return result;
};

const gameOver = (cells: CellT[][]): CellT[][] => {
  const result: CellT[][] = [...cells];
  for (let i = 0; i < RESOLUTION; i++) {
    for (let j = 0; j < RESOLUTION; j++) {
      if (result[i][j].content === "bomb") {
        result[i][j] = {
          ...result[i][j],
          visible: true,
        };
      }
    }
  }

  return result;
};

const renderEmptyIsland = (cells: CellT[][], y: number, x: number) => {
  const checkNearCells = (y: number, x: number) => {
    cells[y][x] = { ...cells[y][x], visible: true };

    for (let k = 1; k < 9; k++) {
      const [newX, newY] = LOOK_AROUND_MAP[k];

      if (
        x + newX >= 0 &&
        y + newY >= 0 &&
        x + newX <= RESOLUTION - 1 &&
        y + newY <= RESOLUTION - 1
      ) {
        const { content, visible } = cells[y + newY][x + newX];
        if (!visible) {
          if (typeof content === "number") {
            cells[y + newY][x + newX] = {
              ...cells[y + newY][x + newX],
              visible: true,
            };
          }
  
          if (content === null) {
            cells[y + newY][x + newX] = {
              ...cells[y + newY][x + newX],
              visible: true,
            };
  
            checkNearCells(y + newY, x + newX);
          }
        }
      }
    }
  };

  checkNearCells(y, x);

  return cells;
};

const winCheck = (cells: CellT[][]): boolean => {
  for (let i = 0; i < RESOLUTION; i++) {
    for (let j = 0; j < RESOLUTION; j++) {
      if (cells[i][j].visible === false) {
        return false
      }
    }
  }
  return true
}

/////////

const Home: NextPage = () => {
  const [cells, setCells] = useState<CellT[][]>(getInitialCells());
  const [flags, setFlags] = useState<number>(RESOLUTION * 2)
  const [score, setScore] = useState<number>(0);
  const [isGameFinished, setIsGameFinished] = useState(false)
  const [isFirstTurn, setIsFirstTurn] = useState(true);

  useEffect(() => {
    if (winCheck(cells)) {
      setIsGameFinished(true)
      alert('You won')
    }
  }, [cells])

  const handlePlaceFlag = (cell: CellT, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    const {x, y, flaged} = cell;
    let newCells = [...cells];

    if (flaged) {
      newCells[y][x] = { ...newCells[y][x], flaged: false, visible: false };
      setFlags(flags + 1)
    } else if (!flaged && flags > 0) {
      newCells[y][x] = { ...newCells[y][x], flaged: true, visible: true };
      setFlags(flags - 1)
    }

    setCells(newCells)
  }

  const handleClick = (cell: CellT) => {
    if (cell.flaged) {
      return
    }

    if (isFirstTurn) {
      setCells(setGameField(cell, cells));
      setIsFirstTurn(false);
      setScore(score + 1);
      return;
    }

    if (cell.content === "bomb") {
      setCells(gameOver(cells));
      setIsGameFinished(true)
      setScore(0);
    }

    const { x, y, content } = cell;
    let newCells = [...cells];

    if (content === null) {
      newCells = renderEmptyIsland(newCells, y, x);
    } else {
      newCells[y][x] = { ...newCells[y][x], visible: true };
    }

    setScore(score + 1);
    setCells(newCells);
  };

  const handleRestart = () => {
    setCells(getInitialCells());
    setIsFirstTurn(true);
    setIsGameFinished(false)
    setFlags(RESOLUTION * 2)
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
          <h2>Score: {score}</h2>
          <button onClick={handleRestart}>restart</button>
          <h2>Flags: {flags}</h2>
        </MenuBlock>

        <GameContainer isGameFinished={isGameFinished} resolution={RESOLUTION}>
          {cells.map((row) =>
            row.map((cell) => (
              <Cell
                visible={cell.visible}
                disabled={cell.visible}
                onClick={() => handleClick(cell)}
                onContextMenu={event => handlePlaceFlag(cell, event)}
                key={cell.id}
              >
                {cell.visible && cellContent(cell.content, cell.flaged)}
              </Cell>
            ))
          )}
        </GameContainer>
      </Main>
    </>
  );
};

export default Home;
