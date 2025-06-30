import { useState } from 'react'
import { isAddress, parseAbi, type Address } from 'viem'
import { usePublicClient } from 'wagmi'
import { useTokens } from '../context/TokensContext'

const ERC20ParsedAbi = parseAbi([
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
])

export default function SearchTokenForm() {
  const publicClient = usePublicClient({ chainId: 16166 })
  const { tokens, addToken } = useTokens()
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!publicClient) {
      setError('Public client not initialized')
      return
    }

    if (!isAddress(address)) {
      setError('Invalid address')
      return
    }

    const exists = tokens.some(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    )
    if (exists) {
      setError('Token already added')
      return
    }

    try {
      setLoading(true)

      const symbol = await publicClient.readContract({
        address: address as Address,
        abi: ERC20ParsedAbi,
        functionName: 'symbol',
      })

      const decimals = await publicClient.readContract({
        address: address as Address,
        abi: ERC20ParsedAbi,
        functionName: 'decimals',
      })

      await addToken({
        symbol: symbol as string,
        address: address.toLowerCase(),
        decimals: Number(decimals),
      })

      setAddress('')
    } catch (e) {
      console.error(e)
      setError(
        e instanceof Error ? e.message : 'Failed to fetch token info'
      )
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
        required
      />
      <button type="submit" style={{ marginLeft: 10 }} disabled={loading}>
        {loading ? 'Adding...' : 'Add'}
      </button>
    </form>
  )
}
