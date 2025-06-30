import { useState } from 'react'
import { ethers } from 'ethers'
import { useTokens } from '../context/TokensContext'
import { useWalletClient } from 'wagmi'
import ERC20ABI from '../lib/abis/ERC20.json'

export default function SearchTokenForm() {
  const { data: walletClient } = useWalletClient()
  const provider = walletClient
    ? new ethers.BrowserProvider(walletClient.transport)
    : undefined
  const { tokens, addToken } = useTokens()
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!provider) {
      setError('Wallet not connected')
      return
    }
    if (!ethers.isAddress(address)) {
      setError('Invalid address')
      return
    }
    const exists = tokens.some(t => t.address.toLowerCase() === address.toLowerCase())
    if (exists) {
      setError('Token already added')
      return
    }
    try {
      setLoading(true)
      const erc20 = new ethers.Contract(address, ERC20ABI, provider)
      const [symbol, decimals] = await Promise.all([
        erc20.symbol(),
        erc20.decimals()
      ])
      await addToken({ symbol, address: address.toLowerCase(), decimals: Number(decimals) })
      setAddress('')
    } catch {
      setError('Failed to fetch token info')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h2>Add Token by Address</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Token address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <button type="submit" style={{ marginLeft: 10 }} disabled={loading}>
        {loading ? 'Adding...' : 'Add'}
      </button>
    </form>
  )
}
