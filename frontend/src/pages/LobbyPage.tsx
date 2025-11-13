import type { ethers } from 'ethers'
import Lobby from '../components/Lobby'

type LobbyPageProps = {
    provider: ethers.JsonRpcProvider
    contractAdress: string
}

export const LobbyPage = ({contractAdress, provider}: LobbyPageProps) => {
  return (
    <Lobby contractAdress={contractAdress} provider={provider}  />
  )
}
