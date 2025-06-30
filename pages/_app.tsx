import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { TokensProvider } from '../context/TokensContext'
import { PoolsProvider } from '../context/PoolsContext'
import { WalletProvider } from '../context/WalletContext'
import { DexSettingsProvider } from '../context/DexSettingsContext'
import { appWithTranslation } from 'next-i18next'
import nextI18NextConfig from '../next-i18next.config'
import { validateAddresses } from '../lib/addresses'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import '../styles/globals.css'

// Ensure required environment variables are set on startup
validateAddresses()

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TokensProvider>
          <PoolsProvider>
            <DexSettingsProvider>
          <div className="background-logo" />
              <Navbar />
              <Component {...pageProps} />
            </DexSettingsProvider>
          </PoolsProvider>
        </TokensProvider>
      </WalletProvider>
    </QueryClientProvider>
  )
}

export default appWithTranslation(MyApp, nextI18NextConfig)
