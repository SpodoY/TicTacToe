import { useNavigate } from "react-router-dom";

type LobbyProps = {
  owner: string;
  gameId: bigint;
}


const LobbyCard = ({ owner, gameId }: LobbyProps) => {

    const navigate = useNavigate();

    return(
        <div>
            <a href="#" className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">GameId: {gameId}</h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">created by {owner} </p>
            <button
                onClick={() => navigate("/game")}
            >
                join
            </button>
            </a>
        </div>
    )

}

export default LobbyCard
