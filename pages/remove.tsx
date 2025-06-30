import { useEffect } from 'react'
import RemoveLiquidityForm from '../components/RemoveLiquidityForm'
import Link from 'next/link'
import { useWallet } from '../context/WalletContext'

export default function RemovePage() {
  const { provider, connectWallet } = useWallet()

  useEffect(() => {
    connectWallet()
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>Remove Liquidity</h1>
      {provider ? (
        <RemoveLiquidityForm provider={provider} />
      ) : (
        <p>🦊 MetaMask に接続してください。</p>
      )}
      <br />
      <Link href="/swap">← Back to Swap</Link>
    </main>
  )
}
