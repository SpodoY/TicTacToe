import { ethers } from 'ethers';
import type { Board, GameState, MoveResult, Player } from "../types/GameState";
import { GameStateManager, type StateChangeCallback, type UnsubscribeFunction } from "../types/GameStateManager";
import TicTacToeABI from '../abis/TicTacToe.json';
import { GameLogic } from '../utils/GameLogic';
import { BoardSize } from '../constants/GameConstants';

enum FieldStatus {
    Unset = 0,
    Player1 = 1,
    Player2 = 2
}

interface BlockchainConfig {
    contractAddress: string;
    onPlayerInfoUpdate?: (player1: string, player2: string) => void;
}

interface GameInfo {
    player1: string;
    player2: string;
    isFinished: boolean;
}

export class BlockchainGameState extends GameStateManager {
    private state: GameState;
    private listeners: StateChangeCallback[];
    private provider: ethers.BrowserProvider | null = null;
    private contract: ethers.Contract | null = null;
    private signer: ethers.Signer | null = null;
    private currentGameId: number | null = null;
    private userAddress: string | null = null;
    private config: BlockchainConfig;
    private gameInfo: GameInfo = { player1: '', player2: '', isFinished: false };

    // Event listeners cleanup
    private eventListeners: Array<() => void> = [];

    constructor(config: BlockchainConfig) {
        super();
        this.config = config;
        this.state = {
            board: GameLogic.createEmptyBoard(),
            currentPlayer: 'X',
            gameResult: null,
            winningLine: []
        };
        this.listeners = [];
    }

    /**
     * Initialize wallet connection and contract instance
     */
    async initGame(): Promise<void> {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
        }

        if (this.contract !== null) {
            console.log(this.contract)
            console.log("already inited ")
            return
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });

        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.userAddress = await this.signer.getAddress();

        this.contract = new ethers.Contract(
            this.config.contractAddress,
            TicTacToeABI.abi,
            this.signer
        );

        this.state = {
            board: GameLogic.createEmptyBoard(),
            currentPlayer: 'X',
            gameResult: null,
            winningLine: []
        };

        this.notifyListeners();
    }

    /**
     * Create a new game on the blockchain
     */
    async createGame(): Promise<number> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        const depositAmount = ethers.parseEther("0.1");
        const tx = await this.contract.createGame({ value: depositAmount });
        const receipt = await tx.wait();

        console.log('Receipt:', receipt);
        console.log('Logs:', receipt.logs);

        // Try to get events using queryFilter as fallback
        let gameId: number | null = null;
        let player1Address: string | null = null;

        // Method 1: Parse from receipt logs
        if (receipt && receipt.logs) {
            for (const log of receipt.logs) {
                try {
                    // Check if this log is from our contract
                    if (log.address.toLowerCase() !== this.config.contractAddress.toLowerCase()) {
                        continue;
                    }

                    const parsedLog = this.contract.interface.parseLog({
                        topics: log.topics as string[],
                        data: log.data
                    });

                    console.log('Parsed log:', parsedLog);

                    if (parsedLog && parsedLog.name === 'GameCreated') {
                        gameId = Number(parsedLog.args[0]); // gameId is first arg
                        player1Address = parsedLog.args[1]; // player1 is second arg
                        console.log('Found GameCreated event:', { gameId, player1Address });
                        break;
                    }
                } catch (e) {
                    console.log('Error parsing log:', e);
                    continue;
                }
            }
        }

        // Method 2: Query filter as fallback
        if (gameId === null) {
            console.log('Trying queryFilter method...');
            const filter = this.contract.filters.GameCreated();
            const events = await this.contract.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
            console.log('Query filter events:', events);

            if (events.length > 0) {
                const event = events[events.length - 1]; // Get the last event
                //@ts-ignore
                gameId = Number(event.args[0]);
                //@ts-ignore
                player1Address = event.args[1];
                console.log('Found via queryFilter:', { gameId, player1Address });
            }
        }

        if (gameId === null) {
            console.error('Failed to find GameCreated event');
            throw new Error('GameCreated event not found in transaction receipt');
        }

        this.currentGameId = gameId;
        this.gameInfo.player1 = player1Address || '';
        this.gameInfo.player2 = ethers.ZeroAddress;

        this.updatePlayerInfo();
        this.setupEventListeners();

        return this.currentGameId;
    }

    /**
     * Join an existing game
     */
    async joinGame(gameId: number): Promise<void> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        const depositAmount = ethers.parseEther("0.1");
        const tx = await this.contract.joinGame(gameId, { value: depositAmount });
        const receipt = await tx.wait();

        // Parse GameJoined event
        for (const log of receipt.logs) {
            try {
                const parsedLog = this.contract.interface.parseLog({
                    topics: [...log.topics],
                    data: log.data
                });

                if (parsedLog && parsedLog.name === 'GameJoined') {
                    this.gameInfo.player1 = parsedLog.args.player1;
                    this.gameInfo.player2 = parsedLog.args.player2;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        this.currentGameId = gameId;
        await this.loadInitialGameState();
        this.updatePlayerInfo();
        this.setupEventListeners();
    }

    /**
     * Load existing game without joining (for navigation)
     */
    async loadExistingGame(gameId: number): Promise<void> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        // Only load if it's a different game or not already loaded
        if (this.currentGameId === gameId) {
            console.log('Game already loaded, skipping...');
            return;
        }

        this.currentGameId = gameId;
        await this.loadInitialGameState();
        this.setupEventListeners();
    }

    /**
     * Load initial game state from blockchain (only called once)
     */
    private async loadInitialGameState(): Promise<void> {
        if (!this.contract || this.currentGameId === null) return;

        try {
            // Fetch open games to get player info
            const game = await this.contract.games( this.currentGameId);
            //const game = openGames.find((g: any) => Number(g.id) === this.currentGameId);

            if (game) {
                this.gameInfo.player1 = game.player1;
                this.gameInfo.player2 = game.player2;
                this.gameInfo.isFinished = game.isFinished;
            }

            this.updatePlayerInfo();

            // Load board state
            const boardData = await this.contract.getGame(this.currentGameId);
            const newBoard = this.convertBoardFromContract(boardData);

            const moveCount = newBoard.filter(cell => cell !== null).length;
            console.log("move count", moveCount)
            const currentPlayer: Player = moveCount % 2 === 0 ? 'X' : 'O';
            const winnerResult = GameLogic.checkIsWinner(newBoard);

            this.state = {
                board: newBoard,
                currentPlayer: winnerResult ? this.state.currentPlayer : currentPlayer,
                gameResult: winnerResult?.winner || null,
                winningLine: winnerResult?.line || []
            };

            this.notifyListeners();
        } catch (error) {
            console.error('Error loading initial game state:', error);
        }
    }

    public getUserSymbol(): Player | null {
        console.log(this.gameInfo)

        if (!this.userAddress || !this.gameInfo.player1) return null;

        return this.userAddress.toLowerCase() === this.gameInfo.player1.toLowerCase()
            ? 'X'
            : 'O';
    }

    /**
     * Setup event listeners for real-time updates
     */
    private setupEventListeners(): void {
        if (!this.contract || this.currentGameId === null) return;

        // Clear existing listeners
        this.clearEventListeners();

        const gameId = this.currentGameId;

        try {
            // Listen for GameJoined events
            const joinedFilter = this.contract.filters.GameJoined(gameId);
            const onGameJoined = (...args: any[]) => {
                const event = args[args.length - 1];
                const [eventGameId, player1, player2] = event.args;

                console.log('Raw GameJoined event received:', { eventGameId, player1, player2, expectedGameId: gameId });

                console.log(typeof (eventGameId))
                console.log(typeof (gameId))
                console.log(eventGameId, gameId)

                if (Number(eventGameId) == gameId) {
                    console.log('GameJoined event matched!', { player1, player2 });
                    this.gameInfo.player1 = player1;
                    this.gameInfo.player2 = player2;
                    this.updatePlayerInfo();
                    console.log('Updated gameInfo:', this.gameInfo);
                } else {
                    console.log('GameJoined event did not match gameId');
                }
            };
            this.contract.on(joinedFilter, onGameJoined);
            this.eventListeners.push(() => this.contract!.off(joinedFilter, onGameJoined));
            console.log('Setup GameJoined listener for gameId:', gameId);
        } catch (error) {
            console.warn('GameJoined event not available in ABI:', error);
        }

        try {
            // Listen for MoveMade events
            const moveFilter = this.contract.filters.MoveMade(gameId);
            const onMoveMade = (...args: any[]) => {
                const event = args[args.length - 1];
                const [eventGameId, player, x, y, nextPlayer] = event.args;

                if (Number(eventGameId) === gameId) {
                    console.log('MoveMade event:', { player, x: Number(x), y: Number(y), nextPlayer });
                    console.log(Number(x), Number(y), player, nextPlayer)
                    this.handleMoveEvent(Number(x), Number(y), player, nextPlayer);
                }
            };
            this.contract.on(moveFilter, onMoveMade);
            this.eventListeners.push(() => this.contract!.off(moveFilter, onMoveMade));
        } catch (error) {
            console.warn('MoveMade event not available in ABI:', error);
        }

        try {
            // Listen for GameFinished events
            const finishFilter = this.contract.filters.GameFinished(gameId);
            const onGameFinished = (...args: any[]) => {
                const event = args[args.length - 1];
                const [eventGameId, winner, isDraw] = event.args;

                if (Number(eventGameId) === gameId) {
                    console.log('GameFinished event:', { winner, isDraw });
                    this.handleGameFinished(winner, isDraw);
                }
            };
            this.contract.on(finishFilter, onGameFinished);
            this.eventListeners.push(() => this.contract!.off(finishFilter, onGameFinished));
        } catch (error) {
            console.warn('GameFinished event not available in ABI:', error);
        }
    }

    /**
     * Handle move event
     */
    private handleMoveEvent(x: number, y: number, player: string, nextPlayer: string): void {
        const position = GameLogic.getPosition({ row: x, col: y });
        const symbol: Player = player.toLowerCase() === this.gameInfo.player1.toLowerCase() ? 'X' : 'O';

        const newBoard = [...this.state.board] as Board;
        newBoard[position] = symbol;

        const winnerResult = GameLogic.checkIsWinner(newBoard);
        const nextSymbol: Player = nextPlayer.toLowerCase() === this.gameInfo.player1.toLowerCase() ? 'X' : 'O';

        this.state = {
            board: newBoard,
            currentPlayer: winnerResult ? this.state.currentPlayer : nextSymbol,
            gameResult: winnerResult?.winner || null,
            winningLine: winnerResult?.line || []
        };

        this.notifyListeners();
    }

    /**
     * Handle game finished event
     */
    private handleGameFinished(winner: string, isDraw: boolean): void {
        this.gameInfo.isFinished = true;

        if (isDraw) {
            this.state = {
                ...this.state,
                gameResult: 'draw'
            };
        } else {
            const winnerSymbol: Player = winner.toLowerCase() === this.gameInfo.player1.toLowerCase() ? 'X' : 'O';
            this.state = {
                ...this.state,
                gameResult: winnerSymbol
            };
        }

        this.notifyListeners();
    }

    /**
     * Convert blockchain board format to local format
     */
    private convertBoardFromContract(boardData: any): Board {
        const newBoard: Board = GameLogic.createEmptyBoard();
        for (let row = 0; row < BoardSize; row++) {
            for (let col = 0; col < BoardSize; col++) {
                const value = Number(boardData[row][col]);
                const linearPosition = GameLogic.getPosition({ row, col });

                if (value === FieldStatus.Player1) {
                    newBoard[linearPosition] = 'X';
                } else if (value === FieldStatus.Player2) {
                    newBoard[linearPosition] = 'O';
                }
            }
        }
        return newBoard;
    }

    /**
     * Update player info callback
     */
    private updatePlayerInfo(): void {
        console.log('updatePlayerInfo called with:', this.gameInfo);
        if (this.config.onPlayerInfoUpdate) {
            this.config.onPlayerInfoUpdate(this.gameInfo.player1, this.gameInfo.player2);
            console.log('Callback executed');
        } else {
            console.warn('No onPlayerInfoUpdate callback configured!');
        }
    }

    /**
     * Get list of open games
     */
    async getOpenGames(): Promise<any[]> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        const openGames = await this.contract.getOpenGames();
        return openGames.map((game: any) => ({
            id: Number(game.id),
            player1: game.player1,
            player2: game.player2,
            moves: Number(game.moves)
        }));
    }

   async getActiveGamesForSender(): Promise<any[]> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        const openGames = await this.contract.getActiveGamesForSender();
        console.log("ope" , openGames)
        return openGames.map((game: any) => ({
            id: Number(game.id),
            player1: game.player1,
            player2: game.player2,
            moves: Number(game.moves)
        }));
    }


    /**
     * Make a move on the blockchain
     */
    async makeMove(position: number): Promise<MoveResult> {
        if (!this.contract || this.currentGameId === null) {
            return { success: false, error: 'Game not initialized' };
        }

        if (this.state.gameResult) {
            return { success: false, error: 'Game already ended' };
        }

        if (!GameLogic.validateMove(this.state.board, position)) {
            return { success: false, error: 'Invalid move: cell already occupied' };
        }

        const { row, col } = GameLogic.getRowCol(position);

        try {
            const tx = await this.contract.makeMove(this.currentGameId, row, col);
            await tx.wait();
            // State will be updated via MoveMade event
            return { success: true, gameState: this.state };
        } catch (error: any) {
            const errorMessage = this.parseError(error);
            return { success: false, error: errorMessage };
        }
    }

    async getGameState(): Promise<GameState> {
        return this.state;
    }

    async resetGame(): Promise<void> {
        this.clearEventListeners();
        this.currentGameId = null;
        this.gameInfo = { player1: '', player2: '', isFinished: false };
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
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

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

    getCurrentGameId(): number | null {
        return this.currentGameId;
    }

    getUserAddress(): string | null {
        return this.userAddress;
    }

    /**
     * Clear all event listeners
     */
    private clearEventListeners(): void {
        this.eventListeners.forEach(cleanup => cleanup());
        this.eventListeners = [];
    }

    /**
     * Cleanup
     */
    disconnect(): void {
        this.clearEventListeners();
        this.provider = null;
        this.contract = null;
        this.signer = null;
        this.currentGameId = null;
        this.userAddress = null;
    }
}