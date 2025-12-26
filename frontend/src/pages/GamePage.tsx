import { useParams } from 'react-router-dom'
import Board from '../components/Board'
import GameControls from '../components/GameControls'
import { GameHeader } from '../components/GameHeader'
import { GameStatus } from '../components/GameStatus'
import { useGameStore } from '../store/gameStore'
import { useEffect } from 'react'

export const GamePage = () => {
  const { id } = useParams();
  const loadGame = useGameStore(state => state.loadGame)
  const currentGameId = useGameStore(state => state.currentGameId)
  const loading = useGameStore(state => state.loading)

  useEffect(() => {
    console.log(id, currentGameId)
    if (id && !currentGameId) {
      const gameId = parseInt(id)
      if (!isNaN(gameId)) {
        loadGame(gameId);
      }
    }
  }, [id, currentGameId, loadGame])

  if (loading && !currentGameId) {
    return (
      <div className="bg-gray-600 rounded-2xl shadow-2xl p-6 w-full">
        <div className="backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-12">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-white text-xl">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-600 rounded-2xl shadow-2xl p-6 w-2xl m-auto">
      <GameHeader />
      <GameStatus />
      <Board />
      <GameControls />
    </div>
  )
}
