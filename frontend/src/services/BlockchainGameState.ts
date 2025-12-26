import type { Board, GameState, MoveResult, Player } from "../types/GameState";
import { GameStateManager, type StateChangeCallback, type UnsubscribeFunction } from "../types/GameStateManager";
import { GameLogic } from "../utils/GameLogic";
import TicTacToeABI from '../abis/TicTacToe.json'
import { BoardSize } from "../constants/GameConstants";
import { ethers } from "ethers";

enum FieldStatus {
    Unset = 0,
    Player1 = 1,
    Player2 = 2
}

interface BlockchainConfig {
    contractAddress: string
    providerUrl?: string
}

export class BlockchainGameState extends GameStateManager {

    private state: GameState;
    private listeners: StateChangeCallback[];

    // Smart Contract & Blockchain Information
    private provider: ethers.BrowserProvider | null = null;
    private contract: ethers.Contract | null = null;
    private signer: ethers.Signer | null | undefined = null;
    private currentGameId: number | null = null;
    private userAddress: string | null = null;
    private config: BlockchainConfig;
    private pollingInterval: NodeJS.Timeout | null = null;


    constructor(config: BlockchainConfig) {
        super();
        this.config = config
        this.state = {
            board: GameLogic.createEmptyBoard(),
            currentPlayer: 'X',
            gameResult: null,
            winningLine: []
        };
        this.listeners = [];
    }

    async initGame(): Promise<void> {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('Metamask is not installed')
        }

        // Ask user for accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' })

        // Create provider and signer for smart contract interaction
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.userAddress = await this.signer.getAddress();

        // 'Link' to contract
        this.contract = new ethers.Contract(
            this.config.contractAddress,
            TicTacToeABI.abi,
            this.signer
        );

        // Start with clean game state
        this.state = {
            board: GameLogic.createEmptyBoard(),
            currentPlayer: 'X',
            gameResult: null,
            winningLine: []
        };

        this.notifyListeners();
    }

    async makeMove(position: number): Promise<MoveResult> {
        if (!this.contract || this.currentGameId === null) {
            console.log(this.contract)
            return GameLogic.unsuccessfulMsg(`Game not initialized - Contract: ${this.contract} - CurrentGameId: ${this.currentGameId}`)
        }

        if (this.state.gameResult) {
            return GameLogic.unsuccessfulMsg('Game already ended')
        }

        if (!GameLogic.validateMove(this.state.board, position)) {
            return GameLogic.unsuccessfulMsg('Invalid move: cell already occupied')
        }

        const { row, col } = GameLogic.getRowCol(position);

        try {
            const tx = await this.contract.makeMove(this.currentGameId, row, col);
            await tx.wait();

            await this.syncGameState();

            return GameLogic.successfulMsg(this.state)
        } catch (error: any) {
            const errorMsg = this.parseError(error);
            return GameLogic.unsuccessfulMsg(errorMsg);
        }
    }

    async getGameState(): Promise<GameState> {
        return this.state;
    }

    async resetGame(): Promise<void> {
        this.stopPolling();
        this.currentGameId = null;
        this.state = {
            board: GameLogic.createEmptyBoard(),
            currentPlayer: 'X',
            gameResult: null,
            winningLine: []
        };
        this.notifyListeners();
    }

    onStateChange(callback: StateChangeCallback): UnsubscribeFunction {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback)
        }
    }

    async joinGame(gameId: number): Promise<void> {
        if (!this.contract) {
            throw new Error('Contract not found or initialized')
        }

        const depositAmount = ethers.parseEther("0.1");
        const tx = await this.contract.joinGame(gameId, { value: depositAmount })
        await tx.wait();

        this.currentGameId = gameId;
        await this.syncGameState();
        this.startPolling();

        this.notifyListeners();
    }

    /**
     * Utility method that gets all open games on the current smart contract
     * @returns A list of open games
     */
    async getOpenGames(): Promise<any[]> {
        if (!this.contract) {
            throw new Error('Contract not found or initialized')
        }

        const openGames = await this.contract.getOpenGames();
        return openGames.map((game: any) => ({
            id: Number(game.id),
            player1: game.player1,
            player2: game.player2,
            moves: Number(game.moves)
        }))
    }

    /**
     * After initGame setups all contract information this can be called to setup a game on the blockchain
     * This is done by calling the `createGame` method on the smart contract (sc).
     */
    async createGame(): Promise<number> {
        if (!this.contract) {
            throw new Error('Contract not found or initialized')
        }

        const depositAmount = ethers.parseEther("0.1");
        const tx = await this.contract.createGame({ value: depositAmount })
        const receipt = await tx.wait();

        // Wait for GameCreated event
        const event = receipt.logs.map((log: any) => {
            try {
                return this.contract!.interface.parseLog(log)
            } catch {
                return null
            }
        })
            .find((parsed: any) => parsed?.name === 'GameCreated')

        if (!event) {
            throw new Error('GameCreated event not found or emitted')
        }

        this.currentGameId = Number(event.args.gameId)
        await this.syncGameState();
        this.startPolling();

        return this.currentGameId;
    }

    async loadExistingGame(gameId: number): Promise<void> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        this.currentGameId = gameId;
        await this.syncGameState();
        this.startPolling();
    }

    getUserAddress(): string | null {
        return this.userAddress;
    }

    getCurrentGameId(): number | null {
        return this.currentGameId
    }

    private async syncGameState(): Promise<void> {
        if (!this.contract || this.currentGameId === null) {
            return;
        }

        try {
            const boardData = await this.contract.getGame(this.currentGameId);

            // Convert 2D board back into array
            const newBoard: Board = GameLogic.createEmptyBoard();
            for (let row = 0; row < BoardSize; row++) {
                for (let col = 0; col < BoardSize; col++) {
                    const val = Number(boardData[row][col])
                    const linPos = GameLogic.getPosition({ row, col });

                    if (val === FieldStatus.Player1) {
                        newBoard[linPos] = 'X'
                    } else if (val === FieldStatus.Player2) {
                        newBoard[linPos] = 'O'
                    } else {
                        newBoard[linPos] = null
                    }
                }
            }

            const moveCount = newBoard.filter(cell => cell !== null).length;
            const currentPlayer: Player = moveCount % 2 === 0 ? 'X' : 'O'

            const winnerResult = GameLogic.checkIsWinner(newBoard);

            this.state = {
                board: newBoard,
                currentPlayer: winnerResult ? this.state.currentPlayer : currentPlayer,
                gameResult: winnerResult?.winner || null,
                winningLine: winnerResult?.line || []
            }

            this.notifyListeners();
        } catch (error) {
            console.error('Error syncing game state:', error)
        }
    }

    /**
    * Start polling for state changes
    */
    private startPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(() => {
            this.syncGameState();
        }, 3000); // Poll every 3 seconds
    }

    /**
    * Stop polling
    */
    private stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Helper function that pushes the current state to all subscribed entities
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

    /**
     * Takes some pre-defined errors and returns "better" error message
     * @param error The caught error inside the function
     * @returns A new error message to display to the user
     */
    private parseError(error: any): string {
        if (error.reason) {
            return error.reason;
        }
        if (error.message) {
            if (error.message.includes('Not your turn')) {
                return 'Not your turn';
            }
            if (error.message.includes('Field already set')) {
                return 'Cell already occupied';
            }
            if (error.message.includes('The game is already over')) {
                return 'Game already ended';
            }
        }
        return 'Transaction failed';
    }
}