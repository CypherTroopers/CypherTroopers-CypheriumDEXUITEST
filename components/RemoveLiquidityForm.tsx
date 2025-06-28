import { useState } from 'react'
import { ethers } from 'ethers'
import { removeLiquidity } from '../lib/removeLiquidity'

interface Props {
  provider: ethers.BrowserProvider
}

export default function RemoveLiquidityForm({ provider }: Props) {
  const [tokenId, setTokenId] = useState('')
  const [liquidity, setLiquidity] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const signer = await provider.getSigner()
      setStatus('Removing liquidity...')
      await removeLiquidity(signer, Number(tokenId), liquidity)
      setStatus('✅ Success!')
    } catch (err: any) {
      console.error(err)
      setStatus('❌ Error: ' + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h2>Remove Liquidity</h2>
      <input
        type="number"
        placeholder="Token ID"
        value={tokenId}
        onChange={e => setTokenId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Liquidity"
        value={liquidity}
        onChange={e => setLiquidity(e.target.value)}
        required
      />
      <button type="submit">Remove</button>
      <p>{status}</p>
    </form>
  )
}
