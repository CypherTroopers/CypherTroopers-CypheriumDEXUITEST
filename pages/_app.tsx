import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { TokensProvider } from '../context/TokensContext'
import { PoolsProvider } from '../context/PoolsContext'
import { WalletProvider } from '../context/WalletContext'
import { DexSettingsProvider } from '../context/DexSettingsContext'
import { appWithTranslation } from 'next-i18next'
import nextI18NextConfig from '../next-i18next.config'

function MyApp({ Component, pageProps }: AppProps) {
  return (
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
  )
}

export default appWithTranslation(MyApp, nextI18NextConfig)
