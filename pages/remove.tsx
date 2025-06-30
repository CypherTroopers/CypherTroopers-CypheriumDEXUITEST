import RemoveLiquidityForm from '../components/RemoveLiquidityForm'
import Link from 'next/link'
import { ethers } from 'ethers'

export default function RemovePage() {
  const provider =
    typeof window !== 'undefined' && window.ethereum
      ? new ethers.BrowserProvider(window.ethereum)
      : undefined

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
