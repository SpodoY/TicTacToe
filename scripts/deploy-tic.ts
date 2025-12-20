import { network } from "hardhat";
import { parseEther } from "viem";
import { ethers } from "ethers";
import ABI from "../frontend/src/abis/TicTacToe.json"

async function main() {
  const { viem } = await network.connect();

  const tic = await viem.deployContract("TicTacToe");

  console.log("Contract deployed at:", tic.address);

  let txHash = await tic.write.createGame({
    value: parseEther("0.1"),
  });
  txHash = await tic.write.createGame({
    value: parseEther("0.1"),
  });

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer1 = await provider.getSigner(0);
  const signer2 = await provider.getSigner(1);

  const contract1 = new ethers.Contract(tic.address, ABI.abi, signer1);

  const txCreate = await contract1.createGame({
    value: ethers.parseEther("0.1"), // send 0.1 ETH
  });

  const receiptCreate = await txCreate.wait();
  console.log("✅ Game created at block:", receiptCreate.blockNumber);


  const contract2 = new ethers.Contract(tic.address, ABI.abi, signer2);

  const gameId = 0;

  const txJoin = await contract2.joinGame(0, {
    value: ethers.parseEther("0.1"),
  });

  const receiptJoin = await txJoin.wait();
  console.log("✅ Joined game", gameId, "in block:", receiptJoin.blockNumber);

  const games = await contract1.games(0)

  console.log(games)

  const board = await contract1.getGame(0)

  console.log(board)

  console.log(await contract1.getOpenGames())

  console.log(tic.address)


}

main().catch(console.error);