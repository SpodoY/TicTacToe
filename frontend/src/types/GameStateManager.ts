import type { GameState, MoveResult } from "./GameState";

export type StateChangeCallback = (state: GameState) => void;

export type UnsubscribeFunction = () => void;

export interface IGameStateManager {
    initGame(): Promise<void>;

    makeMove(position: number): Promise<MoveResult>;

    getGameState(): Promise<GameState>;

    resetGame(): Promise<void>;

    onStateChange(callback: StateChangeCallback): UnsubscribeFunction;
}

export abstract class GameStateManager implements IGameStateManager {
    abstract initGame(): Promise<void>;
    abstract makeMove(position: number): Promise<MoveResult>;
    abstract getGameState(): Promise<GameState>;
    abstract resetGame(): Promise<void>;
    abstract onStateChange(callback: StateChangeCallback): UnsubscribeFunction;
}