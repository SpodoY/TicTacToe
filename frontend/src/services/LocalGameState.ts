import type { Board, GameState, MoveResult } from "../types/GameState";
import { GameStateManager, type StateChangeCallback, type UnsubscribeFunction } from "../types/GameStateManager";
import { GameLogic } from "../utils/GameLogic";


export class LocalGameState extends GameStateManager {

    private state: GameState;
    private listeners: StateChangeCallback[];

    constructor() {
        super();
        this.state = {
            board: GameLogic.createEmptyBoard() as Board,
            currentPlayer: 'X',
            gameResult: null,
            winningLine: []
        };
        this.listeners = [];
    }

    async initGame(): Promise<void> {
        this.state = {
            board: GameLogic.createEmptyBoard() as Board,
            currentPlayer: 'X',
            gameResult: null,
            winningLine: []
        };
        this.notifyListeners();
    }

    async makeMove(position: number): Promise<MoveResult> {
        if (!GameLogic.validateMove(this.state.board, position)) {
            return { success: false, error: 'Invalid move: cell already occupied' }
        }

        if (this.state.gameResult) {
            return { success: false, error: 'Game already ended' }
        }

        this.state.board[position] = this.state.currentPlayer;

        const newBoard = [...this.state.board] as Board;
        newBoard[position] = this.state.currentPlayer;

        const winnerResult = GameLogic.checkIsWinner(this.state.board)

        if (winnerResult?.line) console.log(winnerResult)

        this.state = {
            board: newBoard,
            currentPlayer: winnerResult
                ? this.state.currentPlayer
                : GameLogic.getNextPlayer(this.state.currentPlayer),
            gameResult: winnerResult?.winner || null,
            winningLine: winnerResult?.line || []
        }

        this.notifyListeners();
        return { success: true, gameState: this.state }
    }

    async getGameState(): Promise<GameState> {
        return this.state;
    }

    async resetGame(): Promise<void> {
        await this.initGame();
    }

    onStateChange(callback: StateChangeCallback): UnsubscribeFunction {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback)
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

}