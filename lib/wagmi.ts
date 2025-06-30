import { createConfig, http, ethersTransport } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { metaMask, walletConnect } from '@wagmi/connectors'

export const chains = [mainnet]

export const config = createConfig({
  chains,
  connectors: [
    metaMask({ chains }),
    walletConnect({ projectId: 'wagmi-default' }),
  ],
  transports: { [mainnet.id]: http() },
  ssr: true,
})
