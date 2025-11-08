import { create } from 'zustand';
import { LocalGameState } from '../services/LocalGameState';
import type { GameState } from '../types/GameState';
import type { GameStateManager } from '../types/GameStateManager';
import { GameLogic } from '../utils/GameLogic';

export interface GameStore extends GameState {

    loading: boolean;
    winningLine: number[];

    stateManager: GameStateManager;

    initGame: () => Promise<void>;
    makeMove: (position: number) => Promise<void>;
    resetGame: () => Promise<void>;
    syncState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => {

    const initialManager = new LocalGameState();

    initialManager.onStateChange(newState => {
        get().syncState(newState);
    })

    return {
        board: GameLogic.createEmptyBoard(),
        currentPlayer: 'X',
        gameResult: null,
        loading: false,
        winningLine: [],
        stateManager: initialManager,

        initGame: async () => {
            set({ loading: true });
            await get().stateManager.initGame();
            set({ loading: false });
        },

        makeMove: async (position: number) => {
            set({ loading: true });
            await get().stateManager.makeMove(position);
            set({ loading: false });
        },

        resetGame: async () => {
            set({ loading: true });
            await get().stateManager.resetGame();
            set({ loading: false });
        },

        syncState: (state: GameState) => {
            set({
                board: state.board,
                currentPlayer: state.currentPlayer,
                gameResult: state.gameResult,
                winningLine: state.winningLine,
            });
        },
    }
})