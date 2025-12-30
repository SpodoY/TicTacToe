interface WaitingForOpponentProps {
    playerSymbol: 'X' | 'O' | null
    id: string | undefined
}

export const WaitingForOpponent = ({id, playerSymbol}: WaitingForOpponentProps) => {
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
