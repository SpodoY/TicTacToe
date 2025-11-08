import { BoardSize } from "../constants/GameConstants";
import type { Board, BoardPosition, Cell, Player, WinnerResult } from "../types/GameState";

export class GameLogic {

    static validateMove(board: Board, position: number): boolean {
        if (position < 0 || position > this.getBoardSize()) return false;

        return board[position] == null;
    }

    static checkIsWinner(board: Board): WinnerResult | null {
        const winningLines = this.generateWinningLines(BoardSize)

        for (const line of winningLines) {
            const firstCell = board[line[0]]

            if (!firstCell) continue;

            const isWinningLine = line.every(idx => board[idx] === firstCell);

            if (isWinningLine) {
                return {
                    winner: firstCell as Player,
                    line: line
                }
            }
        }
        
        if (this.isBoardFull(board)) {
            return { winner: 'draw', line: [] }
        }
        return null;
    }

    static getNextPlayer(currentPlayer: Player) {
        return currentPlayer == 'O' ? 'X' : 'O';
    }

    static createEmptyBoard(): Board {
        return Array(this.getBoardSize()).fill(null) as Board
    }

    static getRowCol(position: number): BoardPosition {
        return {
            row: Math.floor(position / BoardSize),
            col: position % BoardSize
        }
    }

    static isBoardFull(board: Cell[]): boolean {
        return !board.some(num => num === null)
    }

    static getPosition(position: BoardPosition) {
        return position.row * BoardSize + position.col
    }
    static getBoardSize(): number {

        return BoardSize * BoardSize;
    }

    private static generateWinningLines(size: number): number[][] {
        const lines: number[][] = [];

        // Rows
        for (let row = 0; row < size; row++) {
            const line: number[] = [];
            for (let col = 0; col < size; col++) {
                line.push(row * size + col);
            }
            lines.push(line);
        }

        // Columns
        for (let col = 0; col < size; col++) {
            const line: number[] = Array();
            for (let row = 0; row < size; row++) {
                line.push(row * size + col);
            }
            lines.push(line);
        }

        // Diagonal (top-left to bottom-right)
        const diag1: number[] = [];
        for (let i = 0; i < size; i++) {
            diag1.push(i * size + i);
        }
        lines.push(diag1);

        // Diagonal (top-right to bottom-left)
        const diag2: number[] = [];
        for (let i = 0; i < size; i++) {
            diag2.push(i * size + (size - 1 - i));
        }
        lines.push(diag2);

        return lines;
    }



}