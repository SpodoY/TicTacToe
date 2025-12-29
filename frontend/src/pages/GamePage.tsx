import { useParams } from 'react-router-dom'
import Board from '../components/Board'
import { GameHeader } from '../components/GameHeader'
import { GameStatus } from '../components/GameStatus'
import { useGameStore } from '../store/gameStore'
import { useEffect } from 'react'

export const GamePage = () => {
  const { id } = useParams();
  const loadGame = useGameStore(state => state.loadGame)
  const currentGameId = useGameStore(state => state.currentGameId)
  const loading = useGameStore(state => state.loading)
  const playerSymbol = useGameStore(state => state.playerSymbol)
  const isWaitingForOpponent = useGameStore(state => state.isWaitingForOpponent)

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

  if (isWaitingForOpponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-12 max-w-md w-full">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Waiting for Opponent</h2>
              <p className="text-purple-200 mb-4">Game #{id}</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <p className="text-gray-300 text-sm mb-2">You are playing as</p>
              <div className="flex items-center justify-center gap-3">
                <div className={`text-5xl font-bold ${playerSymbol === 'X' ? 'text-blue-400' : 'text-pink-400'}`}>
                  {playerSymbol}
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Share this game link with your opponent to start playing!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-600 rounded-2xl shadow-2xl p-6 w-2xl m-auto">
      
      <GameHeader />
      <GameStatus gameId={id ?? ''} playerSymbol={playerSymbol ?? ''} />
      <Board />
      {/* <GameControls /> */}
    </div>
  )
}
