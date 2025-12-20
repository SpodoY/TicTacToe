import type { ethers } from 'ethers'
import Lobby from '../components/Lobby'

export type LobbyProps = {
    provider: ethers.BrowserProvider | null
}

export const LobbyPage = ({provider}: LobbyProps) => {
  return (
    <Lobby provider={provider}  />
  )
}
