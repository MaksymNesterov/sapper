import styled from "styled-components"

export const Main = styled.main`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
`

export const GameContainer = styled.div<{resolution: number, isGameFinished: boolean}>`
    width: 800px;
    height: 800px;
    display: grid;
    grid-template-columns: ${({resolution}) => `repeat(${resolution}, 1fr)`};
    grid-template-rows: ${({resolution}) => `repeat(${resolution}, 1fr)`};
    column-gap: 1px;
    grid-row-gap: 1px;
    pointer-events: ${({isGameFinished}) => isGameFinished ? 'none' : 'all'};
`

export const Cell = styled.button<{visible: boolean}>`
    border: 1px solid black;
    background-color: ${({visible}) => visible ? 'white': 'grey'};
`

export const NumberCell = styled.a<{color: string}>`
    color: ${({color}) => color};
    font-weight: bold;
    font-size: large;
`

export const MenuBlock = styled.div`
    width: 1000px;
    padding: 15px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;

`