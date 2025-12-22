import Board from '../components/Board'
import GameControls from '../components/GameControls'
import { GameHeader } from '../components/GameHeader'
import { GameStatus } from '../components/GameStatus'
import { useParams } from 'react-router-dom';

export const GamePage = () => {

  const { gameId } = useParams<{ gameId: string }>();

  return (
    <div className="bg-gray-600 rounded-2xl shadow-2xl p-6 w-2xl">
            <GameHeader gameId={gameId}/>
            <GameStatus />
            <Board />
            <GameControls />
        </div>
  )
}
