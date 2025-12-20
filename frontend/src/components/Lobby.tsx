import { useEffect, useState } from "react";
import type { LobbyProps } from "../pages/LobbyPage";
import { parseGames, type Game } from "../utils/ethDataMapper";
import LobbyCard from "./LobbyCard";
import { getContract } from "../utils/ContractUtils";
import type { Contract } from "ethers";
import { LoadingSpinner } from "./utils/LoadingSpinner";

const Lobby = ({ provider }: LobbyProps) => {

  const [openGames, setOpenGames] = useState<Game[]>([])
  const [contract, setContract] = useState<Contract>()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  const loadContract = async () => {

    const localContract = await getContract(provider)

    console.log(await provider?.getNetwork());
    console.log(await provider?.send("eth_chainId", []));
    console.log(await provider?.getSigner().then(s => s.getAddress()));

    if (localContract == null) return;

    setContract(localContract)

    try {
      const response = await localContract.getOpenGames();
      console.log('Response:', response)

      setOpenGames(parseGames(response))
      setError(null);

    }
    catch (err: any) {
      console.error(err);
      setError("Failed to load open games");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContract();
    const interval = setInterval(loadContract, 5000);
    return () => clearInterval(interval);
  }, []);

  return (

    <div className="flex flex-col items-center mb-8 w-full gap-6 p-6">
      <button
        className="relative px-8 py-3 text-2xl font-semibold text-white rounded-xl shadow-lg 
        transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 
        bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
        disabled:opacity-70 disabled:cursor-not-allowed`"
      >
        Create Game
      </button>

      <h1 className="text-3xl font-bold text-center mb-2">
        {loading
          ? <div> Loading open lobbies... <LoadingSpinner /> </div>
          : `There ${openGames.length === 1 ? "is" : "are"} ${openGames.length} open ${openGames.length === 1 ? "lobby" : "lobbies"}`}
      </h1>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">
          {error}
        </p>
      )}

      {!loading && openGames.length === 0 && !error && (
        <p className="text-gray-500 dark:text-gray-400">
          No lobbies open at the moment. Be the first to create one!
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {openGames.map((info, idx) => (
          <LobbyCard key={idx} owner={info.player1} gameId={info.id} contract={contract} />
        ))}
      </div>
    </div>


  );
}


export default Lobby