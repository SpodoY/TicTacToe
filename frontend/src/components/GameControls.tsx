import { useGameStore } from "../store/gameStore"

const GameControls = () => {

    const loading = useGameStore(state => state.loading)
    const reset = useGameStore(state => state.resetGame)

    return (
        <div>
            <button
                onClick={reset}
                disabled={loading}
                className="w-full font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                { loading ? 'Loading...' : 'New Game' }
            </button>
        </div>
    )
}

export default GameControls