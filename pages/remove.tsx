import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import RemoveLiquidityForm from '../components/RemoveLiquidityForm'
import Link from 'next/link'

export default function RemovePage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum)
      setProvider(browserProvider)
    }
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
