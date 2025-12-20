import type { Contract } from "ethers";
import { useNavigate } from "react-router-dom";

type LobbyProps = {
  owner: string;
  gameId: bigint;
  contract: Contract | undefined;
}

const LobbyCard = ({ owner, gameId, contract }: LobbyProps) => {

    const navigate = useNavigate();

    const joinLobby = async () => {
        console.log("clicked me")
        const joinResult = await contract?.joinGame(gameId);

        console.log(joinResult);
        return;

        navigate("/game")
    }

    return(
    <div className="w-full max-w-sm">
        <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-all">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white break-words">
            Game ID: {gameId}
            </h5>

            <p className="font-normal text-gray-700 dark:text-gray-400 break-all">
            Created by <span className="font-mono">{owner}</span>
            </p>

            <button
            onClick={joinLobby}
            className="mt-4 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700 transition-all"
            >
            Join
            </button>
        </div>
    </div>
    )

}

export default LobbyCard
