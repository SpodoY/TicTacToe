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
    playerSymbol: 'X' | 'O' | null;
    isWaitingForOpponent: boolean;

    stateManager: GameStateManager;

    initGame: () => Promise<void>;
    loadGame: (gameId: number) => Promise<void>
    makeMove: (position: number) => Promise<void>;
    resetGame: () => Promise<void>;
    syncState: (state: GameState) => void;
    updatePlayerInfo: (player1: string, player2: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => {

    const initialManager = new BlockchainGameState({ 
        contractAddress: '0x10269fB4c2c6F0cb04849Cd61708870691E5A348',
        onPlayerInfoUpdate: (player1: string, player2: string) => {
            get().updatePlayerInfo(player1, player2)
        }
     });

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
        isWaitingForOpponent: false,
        playerSymbol: null,

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

                await manager.initGame()
                // Load game state as user already joined game
                await manager.loadExistingGame(gameId);
                const currentGameId = manager.getCurrentGameId();
                const userAddress = manager.getUserAddress();
                const symbol = manager.getUserSymbol()
                
                set({
                    currentGameId,
                    userAddress,
                    playerSymbol: symbol
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

        updatePlayerInfo: (player1: string, player2: string) => {
            const userAddress = get().userAddress?.toLocaleLowerCase();
            const isPlayer1 = userAddress === player1.toLocaleLowerCase();
            const isPlayer2 = userAddress === player2.toLocaleLowerCase();
            const playerSymbol = isPlayer1 ? 'X' : isPlayer2 ? 'O' : null;
            const isWaitingForOpponent = player2 === '0x0000000000000000000000000000000000000000'

            set({
                isPlayer1,
                isPlayer2,
                playerSymbol,
                isWaitingForOpponent
            })
        }
    }
})