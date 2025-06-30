import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { TokensProvider } from '../context/TokensContext'
import { PoolsProvider } from '../context/PoolsContext'
import { WagmiConfig } from 'wagmi'
import { config } from '../lib/wagmi'
import { DexSettingsProvider } from '../context/DexSettingsContext'

import { appWithTranslation } from 'next-i18next'
import nextI18NextConfig from '../next-i18next.config'
import { validateAddresses } from '../lib/addresses'

// Ensure required environment variables are set on startup
validateAddresses()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <TokensProvider>
        <PoolsProvider>
          <DexSettingsProvider>
            <Navbar />
            <Component {...pageProps} />
          </DexSettingsProvider>
        </PoolsProvider>
      </TokensProvider>
    </WagmiConfig>
  )
}

export default appWithTranslation(MyApp, nextI18NextConfig)
