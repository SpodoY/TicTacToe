import { useGameStore } from '../store/gameStore';
import Cell from './Cell';

const Board = () => {

  const board = useGameStore(state => state.board);
  const loading = useGameStore(state => state.loading);
  const gameResult = useGameStore(state => state.gameResult);
  const winningLine = useGameStore(state => state.winningLine);
  const makeMove = useGameStore(state => state.makeMove);

  const handleCellClick = (idx: number) => {    
    if (!loading && !gameResult) {    
      makeMove(idx);
    }
  }

  const isWinningCell = (idx: number) => winningLine.includes(idx);

  // TODO: make this listen to BoardSize (make that work)
  return (
    <div className={`grid grid-cols-5 gap-3 mb-6`}>
      {board.map((cell, idx) => (
        <Cell
          key={idx}
          value={cell}
          isWinning={isWinningCell(idx)}
          onClick={() => handleCellClick(idx)}
          disabled={loading || !!cell}
        />
      ))}
    </div>
  )
}

export default Board