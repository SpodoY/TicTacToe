import type { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import ABI from "../abis/TicTacToe.json";

export const getContract = async (provider: BrowserProvider | null): Promise<Contract | null> => {

    if (!provider) return null;

    const contractAdress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"

    const signer = await provider.getSigner();
    const contract = new Contract(contractAdress, ABI.abi, signer)
    console.log('Contract loaded:', contract);

    return contract;

    // if (provider) {
    //     const signer = await provider.getSigner();

    //     return new Contract(
    //         contractAdress,
    //         ABI.abi,
    //         signer
    //     );
    // } else {
    //     const readOnly = new JsonRpcProvider("http://127.0.0.1:8545");
    //     return new Contract(
    //         contractAdress,
    //         ABI.abi,
    //         readOnly
    //     );
    // }
}