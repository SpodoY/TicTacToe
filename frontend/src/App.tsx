import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { useMetaMask } from "./hooks/useMetaMask";
import { GamePage } from "./pages/GamePage";
import { LobbyPage } from "./pages/LobbyPage";
import { ethers } from "ethers";
import { WaitingRoomPage } from "./pages/WaitingRoom";

function App() {
  // const { account, chainId, provider } = useMetaMask();
  var provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"
          element={<LobbyPage provider={provider} />}
        />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/waiting/:gameId" element={<WaitingRoomPage provider={provider}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
