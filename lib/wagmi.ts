import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { createPublicClient } from 'viem'

export const chains = [mainnet]

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export const config = createConfig({
  chains,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({ chains, options: { projectId: 'wagmi-default' } }),
  ],
  transports: { [mainnet.id]: ethersTransport(http()) },
  ssr: true,
})
