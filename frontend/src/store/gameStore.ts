import { create } from 'zustand';
import { BlockchainGameState } from '../services/BlockchainGameState';
import type { GameState } from '../types/GameState';
import type { GameStateManager } from '../types/GameStateManager';
import { GameLogic } from '../utils/GameLogic';

export interface GameStore extends GameState {
    loading: boolean;
    winningLine: number[];

    currentGameId: number | null
    userAddress: string | null
    isPlayer1: boolean;
    isPlayer2: boolean;

    stateManager: GameStateManager;

    initGame: () => Promise<void>;
    loadGame: (gameId: number) => Promise<void>
    makeMove: (position: number) => Promise<void>;
    resetGame: () => Promise<void>;
    syncState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => {

    const initialManager = new BlockchainGameState({ contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3' });

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
        currentGameId: null,
        userAddress: null,
        isPlayer1: false,
        isPlayer2: false,

        initGame: async () => {
            set({ loading: true });
            try {
                await get().stateManager.initGame();
                const manager = get().stateManager as BlockchainGameState;
                const address = manager.getUserAddress();
                set({ userAddress: address })
            } catch (error: any) {
                console.error('Failed to init game:', error)
            } finally {
                set({ loading: false });
            }
        },

        loadGame: async (gameId: number) => {
            set({ loading: true });
            try {
                const manager = get().stateManager as BlockchainGameState;

                // Load game state as user already joined game
                await manager.loadExistingGame(gameId);

                const currentGameId = manager.getCurrentGameId();
                const userAddress = manager.getUserAddress();

                set({
                    currentGameId,
                    userAddress,
                });

            } catch (error) {
                console.error('Failed to load game:', error);
            } finally {
                set({ loading: false });
            }
        },

        makeMove: async (position: number) => {
            set({ loading: true });
            try {
                const moveResult = await get().stateManager.makeMove(position);
                if (moveResult.error) {
                    console.error('Failed to make move:', moveResult.error)
                }
            } catch (error: any) {
                console.error('Failed to make move:', error)
            } finally {
                set({ loading: false });
            }
        },

        resetGame: async () => {
            set({ loading: true });
            try {
                await get().stateManager.resetGame();
                set({
                    currentGameId: null,
                    isPlayer1: false,
                    isPlayer2: false
                })
            } catch (error: any) {
                console.error('Failed to reset game:', error)
            } finally {
                set({ loading: false });
            }
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