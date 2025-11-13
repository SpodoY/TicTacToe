import Board from "./Board";
import GameControls from "./GameControls";
import { GameHeader } from "./GameHeader";
import { GameStatus } from "./GameStatus";

const GameView = () => {

    return(
        <div className="bg-gray-600 rounded-2xl shadow-2xl p-6 w-2xl">
            <GameHeader />
            <GameStatus />
            <Board />
            <GameControls />
        </div>
    )

}


export default GameView