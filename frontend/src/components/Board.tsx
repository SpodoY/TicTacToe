import { useGameStore } from '../store/gameStore';
import Cell from './Cell';

const Board = () => {

  const board = useGameStore(state => state.board);
  const loading = useGameStore(state => state.loading);
  const gameResult = useGameStore(state => state.gameResult);
  const winningLine = useGameStore(state => state.winningLine);
  const makeMove = useGameStore(state => state.makeMove);
  const playerSymbol = useGameStore(state => state.playerSymbol);
  const pendingMove = useGameStore(state => state.pendingMove);

  const handleCellClick = (idx: number) => {    
    if (!loading && !gameResult && pendingMove === null) {    
      makeMove(idx);
    }
  }

  const isWinningCell = (idx: number) => winningLine.includes(idx);

  const getCellValue = (idx: number) => {
    if (pendingMove === idx && playerSymbol) {
      return playerSymbol
    }

    return board[idx]
  } 

  const isCellPending = (idx: number) => pendingMove === idx;

  // TODO: make this listen to BoardSize (make that work)
  return (
    <div className={`grid grid-cols-5 gap-3 mb-6`}>
      {board.map((cell, idx) => (
        <Cell
          key={idx}
          value={getCellValue(idx)}
          isWinning={isWinningCell(idx)}
          onClick={() => handleCellClick(idx)}
          disabled={pendingMove !== null || !!cell}
          isPending={isCellPending(idx)}
        />
      ))}
    </div>
  )
}

export default Board