import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { GameLobby } from "./pages/GameLobbyPage";
import { GamePage } from "./pages/GamePage";
import { BlockchainGameState } from "./services/BlockchainGameState";
import { useGameStore } from "./store/gameStore";

function App() {
  // var provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const initGame = useGameStore(state => state.initGame)
  const stateManager = useGameStore(state => state.stateManager)

  useEffect(() => {
    initGame();
  }, [initGame])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"
          element={<GameLobby gameState={ stateManager as BlockchainGameState } /> }
        />
        <Route path="/game/:id" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
