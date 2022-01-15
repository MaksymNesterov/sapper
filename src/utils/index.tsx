import { RESOLUTION } from "pages";
import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { NumberCell } from "styles/styled";
import { NumbersMap, CellT } from "types";
import { v4 as uuidv4 } from 'uuid';
import BombIcon from "../assets/bomb.svg";
import FlagIcon from "../assets/flag.svg";

export const LOOK_AROUND_MAP: { [key in number]: number[] } = {
    1: [-1, -1],
    2: [-1, 0],
    3: [-1, 1],
    4: [0, -1],
    5: [0, 1],
    6: [1, -1],
    7: [1, 0],
    8: [1, 1],
  };
  
  export const NUMBERS_COLOR_MAP: NumbersMap = {
    1: "#ff0000",
    2: "#ffa500",
    3: "#ffff00",
    4: "#008000",
    5: "#0000ff",
    6: "#4b0082",
    7: "#ee82ee",
    8: "black",
  };


//////////////

export const getInitialCells = (): CellT[][] => {
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
  
export const cellContent = (content: null | number | "bomb", flaged?: boolean) => {
    if (flaged) {
      return <FlagIcon />;
    }
    if (content === "bomb") {
      return <BombIcon />;
    }
    if (typeof content === "number") {
      return (
        <NumberCell color={NUMBERS_COLOR_MAP[content]}>{content}</NumberCell>
      );
    }
  };
  
export const setGameField = (cell: CellT, initialField: CellT[][]) => {
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
  
    if (result[cell.y][cell.x].content === null) {
      return renderEmptyIsland(result, cell.y, cell.x);
    }
  
    return result;
  };
  
  export  const gameOver = (cells: CellT[][]): CellT[][] => {
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
  
  export const renderEmptyIsland = (cells: CellT[][], y: number, x: number) => {
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
  
  export const winCheck = (cells: CellT[][]): boolean => {
    for (let i = 0; i < RESOLUTION; i++) {
      for (let j = 0; j < RESOLUTION; j++) {
        if (cells[i][j].visible === false) {
          return false;
        }
      }
    }
    return true;
  };

  export const token = uuidv4()

  export const InitSocketConnection = async (): Promise<Socket<DefaultEventsMap, DefaultEventsMap>> => {
    const socket = io({query: {token}})
  
    await fetch('/api/socket').finally(() => {
  
      socket.on('connect', () => {
        console.log('connect')
      })
    
      socket.on('a user connected', () => {
        console.log('a user connected')
      })
  
      socket.on('disconnect', () => {
        console.log('disconnect')
      })
    })
  
    return socket
  }
