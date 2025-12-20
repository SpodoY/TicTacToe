export interface Game {
  player1: string;
  player2: string;
  id: bigint;
  board: FieldStatus[][];
  currentPlayer: string;
  isFinished: boolean;
  moves: bigint;
}

export type FieldStatus = number; // or enum if you have a specific enum mapping


/**
 * Converts raw games returned from the smart contract to typed Game[]
 * @param rawGames - The raw array of games from ethers.js
 */
export function parseGames(rawGames: any[]): Game[] {
  return rawGames.map((g: any) => ({
    player1: g[0],
    player2: g[1],
    id: BigInt(g[2]),
    board: g[3].map((row: any[]) => row.map((cell: any) => Number(cell))) as FieldStatus[][],
    currentPlayer: g[4],
    isFinished: g[5],
    moves: BigInt(g[6]),
  }));
}