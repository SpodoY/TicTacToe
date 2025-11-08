export type Player = 'X' | 'O';

export type Cell = Player | null;

export type Board = Cell[]

export type GameResult = Player | 'draw' | null;

export type BoardPosition = {
    row: number,
    col: number
}

export type WinnerResult = {
    winner: Player | 'draw',
    line: number[];
}

export interface GameState {
    board: Board;
    currentPlayer: Player;
    gameResult: GameResult;
    winningLine: number[];
}

export type MoveResult = {
    success: boolean;
    error?: string;
    gameState?: GameState
}