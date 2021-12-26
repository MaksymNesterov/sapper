import { ReactElement } from "react"

export type CellT = {
    id: number,
    x: number,
    y: number,
    visible: boolean,
    content: null | number | 'bomb'
    flaged: boolean,
  }

export type NumbersMap = {[key in number]: string}
