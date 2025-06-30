import { createConfig, http } from 'wagmi'
import { metaMask, walletConnect } from 'wagmi/connectors'

export const cypherium = {
  id: 16166,
  name: 'Cypherium',
  nativeCurrency: {
    name: 'Cypher',
    symbol: 'CPH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://pubnodes.cypherium.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Cypherium Explorer',
      url: 'https://explorer.cypherium.io',
    },
  },
}

export const config = createConfig({
  chains: [cypherium],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: 'c1d4a9f663adfcabe906db1a885e8b21',
      showQrModal: true,
    }),
  ],
  transports: {
    [cypherium.id]: http(cypherium.rpcUrls.default.http[0]),
  },
  ssr: true,
})
