import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { useMetaMask } from "./hooks/useMetaMask";
import { GamePage } from "./pages/GamePage";
import { LobbyPage } from "./pages/LobbyPage";
import { ethers } from "ethers";

function App() {
  // const { account, chainId, provider } = useMetaMask();
  var provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"
          element={<LobbyPage provider={provider} />}
        />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
