import { useGameStore } from '../store/gameStore';

type GameStatusProps = {
    gameId: string,
    playerSymbol: string
}

export const GameStatus = ({ gameId, playerSymbol }: GameStatusProps) => {

    const currentPlayer = useGameStore(state => state.currentPlayer);
    const gameResult = useGameStore(state => state.gameResult);

    return (
        <div className='mb-6'>
            {gameResult ? (
                <div className='text-center'>
                    <p className='text-3xl font-bold'>
                        {gameResult === 'draw'
                            ? "Draw - Better luck next time"
                            : `Player ${gameResult} Wins`}
                    </p>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-lg text-gray-400">Game {gameId}</p>
                    <p className="text-lg text-gray-400">You are {playerSymbol}</p>
                    <p className="text-xl text-gray-400">Current Player:</p>
                    <p className="text-4xl font-bold text-gray-200">
                        {currentPlayer}
                    </p>
                </div>
            )
            }
        </div>
    )
}
