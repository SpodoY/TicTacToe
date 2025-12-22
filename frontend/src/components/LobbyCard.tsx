import { useState } from "react"; // Added useState
import type { Contract } from "ethers";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

type LobbyProps = {
  owner: string;
  gameId: bigint;
  contract: Contract | undefined;
}

const LobbyCard = ({ owner, gameId, contract }: LobbyProps) => {
  const navigate = useNavigate();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const joinLobby = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!contract) throw new Error("Contract not initialized");

      const tx = await contract.joinGame(gameId, {
        value: ethers.parseEther("0.1"),
      });

      await tx.wait();

      navigate(`/game/${gameId}`);

    } catch (er: any) {
      console.error("er", er);
      
      if (er.code === "ACTION_REJECTED") {
        setError("User denied transaction signature.");
      } else if (er.reason) {
        setError(er.reason);
      } else {
        setError("Cant join this game ");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-all">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white break-words">
          Game ID: {gameId.toString()}
        </h5>

        <p className="font-normal text-gray-700 dark:text-gray-400 break-all">
          Created by <span className="font-mono text-xs">{owner}</span>
        </p>

        {error && (
          <div className="mt-4 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <button
          onClick={joinLobby}
          disabled={loading}
          className="mt-4 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Processing..." : "Join"}
        </button>
      </div>
    </div>
  )
}

export default LobbyCard;