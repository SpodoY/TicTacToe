import { network } from "hardhat";
import { parseEther } from "viem";
import { ethers } from "ethers";
import ABI from "../frontend/src/abis/TicTacToe.json"

async function main() {
  const { viem } = await network.connect();

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer2 = await provider.getSigner(1);

  const contract2 = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3", ABI.abi, signer2);

  const txJoin = await contract2.joinGame(25, {
    value: ethers.parseEther("0.1"),
  });


}

main().catch(console.error);