import RemoveLiquidityForm from '../components/RemoveLiquidityForm'
import Link from 'next/link'
import { useWalletClient } from 'wagmi'
import { ethers } from 'ethers'

export default function RemovePage() {
  const { data: walletClient } = useWalletClient()
  const provider = walletClient
    ? new ethers.BrowserProvider(walletClient.transport)
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
