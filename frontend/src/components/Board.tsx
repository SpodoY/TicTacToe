import { useEffect } from 'react';
import { BoardSize } from '../constants/GameConstants';
import { useGameStore } from '../store/gameStore';
import Cell from './Cell';

const Board = () => {

  const board = useGameStore(state => state.board);
  const loading = useGameStore(state => state.loading);
  const gameResult = useGameStore(state => state.gameResult);
  const winningLine = useGameStore(state => state.winningLine);

  const makeMove = useGameStore(state => state.makeMove);
  const initGame = useGameStore(state => state.initGame);

  useEffect(() => {
    initGame();
  }, [initGame])

  const handleCellClick = (idx: number) => {    
    if (!loading && !gameResult) {    
      makeMove(idx);
    }
  }

  useEffect(() => {
  }, [winningLine])

  const isWinningCell = (idx: number) => winningLine.includes(idx);

  return (
    <div className={`grid grid-cols-${BoardSize} gap-3 mb-6`}>
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