import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BlockchainGameState } from '../services/BlockchainGameState';

interface OpenGame {
    id: number;
    player1: string;
    player2: string;
    moves: number;
}

interface GameLobbyProps {
    gameState: BlockchainGameState;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ gameState }) => {
    const navigate = useNavigate();
    const [openGames, setOpenGames] = useState<OpenGame[]>([]);
    const [activeGames, setActiveGames] = useState<OpenGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState<number | null>(null);
    const userAddress = gameState.getUserAddress();

    useEffect(() => {
        loadOpenGames();
        // Refresh lobby every 2 seconds
        console.log('Internal loadOpenGames triggered')
        const interval = setInterval(loadOpenGames, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadOpenGames = async () => {
        try {
            setLoading(true)
            setError(null);
            const games = await gameState.getOpenGames();
            setOpenGames(games);
            const playingGmaes = await  gameState.getActiveGamesForSender();
            setActiveGames(playingGmaes)
            console.log('Successfully loaded games')
        } catch (err: any) {
            console.error('Error loading games:', err);
            setError('Failed to load games');
        } finally {
            setLoading(false)
        }
    };

    const handleCreateGame = async () => {
        setCreating(true);
        setError(null);
        try {
            const gameId = await gameState.createGame();
            navigate(`/game/${gameId}`);
        } catch (err: any) {
            console.error('Error creating game:', err);
            setError(err.message || 'Failed to create game');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinGame = async (gameId: number) => {
        setJoining(gameId);
        setError(null);
        try {
            await gameState.joinGame(gameId);
            navigate(`/game/${gameId}`);
        } catch (err: any) {
            console.error('Error joining game:', err);
            setError(err.message || 'Failed to join game');
        } finally {
            setJoining(null);
        }
    };


    const handleJoinActiveGame = async (gameId: number) => {
        setJoining(gameId);
        setError(null);
        try {
            navigate(`/game/${gameId}`);
        } catch (err: any) {
            console.error('Error joining game:', err);
            setError(err.message || 'Failed to join game');
        } finally {
            setJoining(null);
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="flex items-center justify-center p-4 w-full">
            <div className="max-w-4xl w-full">
                <div className="bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
                        <p className="text-purple-200">
                            Connected: {userAddress ? truncateAddress(userAddress) : 'Not connected'}
                        </p>
                    </div>

                    {/* Create Game Button */}
                    <div className="mb-8">
                        <button
                            onClick={handleCreateGame}
                            disabled={creating}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                        >
                            {creating ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Game...
                                </span>
                            ) : (
                                '+ Create New Game (0.1 ETH)'
                            )}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                            <p className="text-red-200 text-center">{error}</p>
                        </div>
                    )}

                    {/* Active Games List */}

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">Your Active Games</h2>
                            <button
                                onClick={loadOpenGames}
                                disabled={loading}
                                className="text-purple-300 hover:text-purple-100 transition-colors"
                            >
                                <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                    <div className="space-y-3">
                                    {activeGames.map((game) => {
                                        return (
                                            <div
                                                key={game.id}
                                                className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-white font-bold text-lg">
                                                                Game #{game.id}
                                                            </span>
                            
                                                        </div>
                                                        <div className="text-gray-300 text-sm">
                                                            <span className="text-gray-400">Host:</span>{' '}
                                                            {truncateAddress(game.player1)}
                                                        </div>
                                                        <div className="text-gray-400 text-xs mt-1">
                                                            Stake: 0.1 ETH
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleJoinActiveGame(game.id)}
                                                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed min-w-[120px]"
                                                    >
                                                        Continue
    
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <br/>


                    {/* Open Games List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">Open Games</h2>
                            <button
                                onClick={loadOpenGames}
                                disabled={loading}
                                className="text-purple-300 hover:text-purple-100 transition-colors"
                            >
                                <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        {openGames.length === 0 ? (
                            <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                                <div className="text-6xl mb-4">🎮</div>
                                <p className="text-gray-300 text-lg">No open games available</p>
                                <p className="text-gray-400 text-sm mt-2">Create a new game to get started!</p>
                            </div>
                        ) :
                            (
                                <div className="space-y-3">
                                    {openGames.map((game) => {
                                        const isOwnGame = game.player1.toLowerCase() === userAddress?.toLowerCase();
                                        return (
                                            <div
                                                key={game.id}
                                                className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-white font-bold text-lg">
                                                                Game #{game.id}
                                                            </span>
                                                            {isOwnGame && (
                                                                <span className="bg-purple-500/30 text-purple-200 text-xs px-2 py-1 rounded-full">
                                                                    Your Game
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-gray-300 text-sm">
                                                            <span className="text-gray-400">Host:</span>{' '}
                                                            {truncateAddress(game.player1)}
                                                        </div>
                                                        <div className="text-gray-400 text-xs mt-1">
                                                            Stake: 0.1 ETH
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleJoinGame(game.id)}
                                                        disabled={isOwnGame || joining === game.id}
                                                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed min-w-[120px]"
                                                    >
                                                        {joining === game.id ? (
                                                            <span className="flex items-center justify-center">
                                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                                </svg>
                                                            </span>
                                                        ) : isOwnGame ? (
                                                            'Waiting...'
                                                        ) : (
                                                            'Join Game'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};