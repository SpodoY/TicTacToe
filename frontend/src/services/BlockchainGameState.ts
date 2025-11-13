import type { Board, GameState, MoveResult } from "../types/GameState";
import { GameStateManager, type StateChangeCallback, type UnsubscribeFunction } from "../types/GameStateManager";
import { GameLogic } from "../utils/GameLogic";


export class BlockchainGameState extends GameStateManager {

    private state: GameState;
    private listeners: StateChangeCallback[];

    constructor() {
        super();
        this.state = {

        };
        this.listeners = [];
    }

    initGame(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    makeMove(position: number): Promise<MoveResult> {
        throw new Error("Method not implemented.");
    }
    getGameState(): Promise<GameState> {
        throw new Error("Method not implemented.");
    }
    resetGame(): Promise<void> {
        throw new Error("Method not implemented.");
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