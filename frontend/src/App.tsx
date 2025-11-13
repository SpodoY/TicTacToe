import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { GamePage } from "./pages/GamePage";
import { LobbyPage } from "./pages/LobbyPage";

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
    <BrowserRouter>
      <Routes>
        <Route path="/"
          element={<LobbyPage provider={provider}
            contractAdress="0x1429859428c0abc9c2c47c8ee9fbaf82cfa0f20f" />}
        />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
