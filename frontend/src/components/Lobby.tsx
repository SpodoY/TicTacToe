import { useEffect, useState } from "react";
import type { LobbyProps } from "../pages/LobbyPage";
import { parseGames, type Game } from "../utils/ethDataMapper";
import LobbyCard from "./LobbyCard";
import { getContract } from "../utils/ContractUtils";
import type { Contract } from "ethers";
import { ethers } from "ethers";
import { LoadingSpinner } from "./utils/LoadingSpinner";
import { useNavigate } from "react-router-dom";


const Lobby = ({ provider }: LobbyProps) => {

  const [openGames, setOpenGames] = useState<Game[]>([])
  const [contract, setContract] = useState<Contract>()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();


  const loadContract = async () => {

    const localContract = await getContract(provider)
    const signer = await provider!!.getSigner();
    const myAddress = await signer.getAddress();

    if (localContract == null) return;

    setContract(localContract)

    try {
      const response = await localContract.getOpenGames();
      console.log('Response:', response)

      setOpenGames(parseGames(response).filter((game) => game.player1 !== myAddress ))
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

  const handleCreateGame = async () => {
  if (!contract) {
    console.error("Contract not Set");
    return;
  }

  setIsCreating(true);
  try {
    // 1. Send the transaction
    const tx = await contract.createGame({
      value: ethers.parseEther("0.1")
    });

    setIsConfirming(true);
    
    const receipt = await tx.wait();

    const event = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find((parsedLog: any) => parsedLog?.name === "GameCreated");

    if (event) {
      const gameId = event.args.gameId;
      console.log("New Game Created with ID:", gameId.toString());
      
      navigate(`/waiting/${gameId}`);
    } else {
      throw new Error("GameCreated event not found in transaction logs");
    }

  } catch (err: any) {
    console.error("Transaction failed", err);
    setError(err.reason || "Failed to create game");
  } finally {
    setIsCreating(false);
    setIsConfirming(false);
  }
};

  return (

    <div className="flex flex-col items-center mb-8 w-full gap-6 p-6">
      {/* Main Action Button */}
      <button
        onClick={() => setIsConfirming(true)}
        disabled={isCreating || !contract}
        className="relative px-8 py-3 text-2xl font-semibold text-white rounded-xl shadow-lg 
    transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 
    bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
    disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isCreating ? "Processing..." : "Create Game"}
      </button>

      {/* Confirmation Dialog Overlay */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4">Confirm Game Creation</h3>
            <p className="text-gray-600 mb-6">
              Do you want to create a new game? This requires a deposit of <b>0.1 ETH</b>.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsConfirming(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isCreating ? "Confirming..." : "Yes, Create"}
              </button>
            </div>
          </div>
        </div>
      )}

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