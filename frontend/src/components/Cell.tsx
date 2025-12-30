import type { Player } from '../types/GameState';
import { LoadingSpinner } from './utils/LoadingSpinner';

type CellProps = {
  value: Player | null;
  isWinning: boolean;
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
}

const Cell = ({ value, disabled, isWinning, onClick, isPending }: CellProps) => {

  const stylings = {
    winningStyling: 'bg-green-400 text-white shadow-lg',
    loggedInStyling: 'bg-gray-100 text-gray-800',
    defaultStyling: 'bg-purple-100 hover:bg-purple-200 text-transparent'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || !!value}
      className={`flex justify-center items-center aspect-square rounded-xl font-bold transition-all duration-200 transform hover:scale-105 text-white
        ${value
          ? isWinning
            ? stylings.winningStyling
            : stylings.loggedInStyling
          : stylings.defaultStyling
        }
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        disabled:hover:scale-100
        `}
    >
      {isPending 
        ? <LoadingSpinner /> 
        : <p className='text-4xl'> <b>{value || ''}</b></p> }
    </button>
  )
}

export default Cell
