import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { TokensProvider } from '../context/TokensContext'
import { PoolsProvider } from '../context/PoolsContext'
import { WalletProvider } from '../context/WalletContext'
import { DexSettingsProvider } from '../context/DexSettingsContext'
import { validateAddresses } from '../lib/addresses'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    // Ensure required environment variables are set on startup
    validateAddresses()

    // 確認のため console.log を入れるのもおすすめ
    console.log("NEXT_PUBLIC_WETH9_ADDRESS:", process.env.NEXT_PUBLIC_WETH9_ADDRESS)
  }, [])

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

export default MyApp
