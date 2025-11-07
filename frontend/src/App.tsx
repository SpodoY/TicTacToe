import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { ethers } from "ethers";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
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
  },[])

  const Square = (value: string, onSquareClick: () => void) => {
    return (
      <button className="square" onClick={onSquareClick}>
        {value}
      </button>
    )
  }

  return (
    <>
    <div className="gameBoard">
      <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={async () => await fetchCurBlock()}>
          Current block is: {block}
        </button>
    </div>
    </>
  );
}

export default App;
