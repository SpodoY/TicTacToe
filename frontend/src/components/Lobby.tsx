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

    const loadContract = async () => {

        const daiContract = new ethers.Contract(contractAdress, ABI.abi, provider);
      
        setOpenGames(parseGames( await daiContract.getOpenGames()))
    };

  useEffect(() => {

    loadContract();
  }, []);


  return (
    <div className="flex flex-col items-center mb-6 w-full gap-4">
        <h1 className="text-3xl font-bold mb-4">
            There are {openGames.length} Lobbys open
        </h1>
        {openGames.map((info, idx) => (
            <LobbyCard
            key={idx}
            owner={info.player1}
            gameId={info.id}
            />
        ))}
    </div>

  );
} 


export default Lobby