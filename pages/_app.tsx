import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { TokensProvider } from '../context/TokensContext'
import { WalletProvider } from '../context/WalletContext'
import { appWithTranslation } from 'next-i18next'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TokensProvider>
      <WalletProvider value={{ account: undefined, connectWallet: () => {} }}>
        <div className="background-logo" />
        <Navbar />
        <Component {...pageProps} />
      </WalletProvider>
    </TokensProvider>
  )
}

export default appWithTranslation(MyApp)
