import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TicTacToeModule", (m) => {
  const tictactoe = m.contract("TicTacToe", [], );

  m.call(tictactoe, "createGame");

  return { tictactoe: tictactoe };
});
