export type GameHeaderProps = {
    gameId : string | undefined
}

export const GameHeader = ({gameId}: GameHeaderProps) => {

    return (
        <div className="flex flex-row items-center mb-6 w-full">
            <h1 className="text-3xl font-bold text-center">
                TicTacToe
            </h1>
            <h2 className="text-xl font-semibold text-gray-600 text-center"> 
                GameId: {gameId}
            </h2>
        </div>
    )
}