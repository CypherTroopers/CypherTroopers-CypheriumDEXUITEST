// pages/_app.tsx
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { TokensProvider } from '../context/TokensContext'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TokensProvider>
      <div className="background-logo" />
      <Navbar />
      <Component {...pageProps} />
    </TokensProvider>
  )
}
