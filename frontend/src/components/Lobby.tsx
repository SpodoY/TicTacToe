import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ABI from "../abis/TicTacToe.json";
import LobbyCard from "./LobbyCard";
import { parseGames, type Game } from "../utils/ethDataMapper";

interface LobbyParams {
    provider: ethers.JsonRpcProvider
    contractAdress: string
}

const Lobby = ({ provider, contractAdress }: LobbyParams) => {

    const [openGames, setOpenGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)

    const loadContract = async () => {

        try{
          const daiContract = new ethers.Contract(contractAdress, ABI.abi, provider); 
          setOpenGames(parseGames( await daiContract.getOpenGames()))
          setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load open games");
      } finally {
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
        className="relative px-8 py-3 text-lg font-semibold text-white rounded-xl shadow-lg 
        transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 
        bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
        disabled:opacity-70 disabled:cursor-not-allowed`"
      >
        Create Game
      </button>

      <h1 className="text-3xl font-bold text-center mb-2">
        {loading
          ? "Loading open lobbies..."
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
          <LobbyCard key={idx} owner={info.player1} gameId={info.id} />
        ))}
      </div>
    </div>
  

  );
} 


export default Lobby