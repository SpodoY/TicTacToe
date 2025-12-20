import { useGameStore } from '../store/gameStore';

export const GameStatus = () => {

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
