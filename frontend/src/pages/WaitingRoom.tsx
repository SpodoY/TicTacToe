import type { ethers } from 'ethers'
import WaitingRoomCard from '../components/WaitingRoomCard'
import { useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { parseGames, type Game } from "../utils/ethDataMapper";
import { getContract } from "../utils/ContractUtils";
import type { Contract } from "ethers";

export type WaitingRoomProps = {
    gameId: string | undefined,
    contract: ethers.Contract | undefined
}

export type PassedProvider = {
    provider: ethers.BrowserProvider | null
}

export const WaitingRoomPage = ({ provider }: PassedProvider) => {
  const { gameId } = useParams<{ gameId: string }>();
  const [contract, setContract] = useState<Contract>();

  useEffect(() => {
    const init = async () => {
      if (!provider) return;
      const localContract = await getContract(provider);
      if (localContract) {
        setContract(localContract);
      }
    };
    init();
  }, [provider]);

  return (
    <div>
      {contract ? (
        <WaitingRoomCard gameId={gameId} contract={contract} />
      ) : (
        <div className="flex justify-center p-10">Connecting to Contract...</div>
      )}
    </div>
  );
};
