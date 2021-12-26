import { ReactElement } from "react"

export type CellT = {
    id: number,
    x: number,
    y: number,
    visible: boolean,
    content: null | number | 'bomb'
  }

export type NumbersMap = {[key in number]: ReactElement}
