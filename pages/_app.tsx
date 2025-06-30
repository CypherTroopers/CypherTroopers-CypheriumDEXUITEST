import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { TokensProvider } from '../context/TokensContext'
import { PoolsProvider } from '../context/PoolsContext'
import { WagmiConfig } from 'wagmi'
import { config } from '../lib/wagmi'
import { DexSettingsProvider } from '../context/DexSettingsContext'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { appWithTranslation } from 'next-i18next'
import nextI18NextConfig from '../next-i18next.config'
import { validateAddresses } from '../lib/addresses'

// Ensure required environment variables are set on startup
validateAddresses()

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
)

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  publicClient,
  webSocketPublicClient,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <TokensProvider>
        <PoolsProvider>
          <DexSettingsProvider>
            <WalletProvider>
              <div className="background-logo" />
              <Navbar />
              <Component {...pageProps} />
            </WalletProvider>
          </DexSettingsProvider>
        </PoolsProvider>
      </TokensProvider>
    </WagmiConfig>
  )
}

export default appWithTranslation(MyApp, nextI18NextConfig)
