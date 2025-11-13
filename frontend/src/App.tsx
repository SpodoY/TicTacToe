import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import Board from "./components/Board";
import GameControls from "./components/GameControls";
import { GameHeader } from "./components/GameHeader";
import { GameStatus } from "./components/GameStatus";

function App() {
  const [block, setBlock] = useState(0);
  const [pending, setPending] = useState([]);

  var provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const fetchCurBlock = async () => {
    var blockNumber = await provider.getBlockNumber();
    console.log(blockNumber);
    setBlock(blockNumber);
  };

  const getPendingTransactions = async () => {
    const pendingBlock = await provider.send("eth_getBlockByNumber", [
      "pending",
      false,
    ]);
    setPending(pendingBlock)
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getPendingTransactions()
    }, 6000);

    return () => clearInterval(interval);
  }, [])

  return (
    <div className="bg-gray-600 rounded-2xl shadow-2xl p-6 w-2xl">
      <GameHeader />
      <GameStatus />
      <Board />
      <GameControls />
      <button onClick={fetchCurBlock} className="mt-6">
        Current block: {block}
      </button>
    </div>
  );
}

export default App;
