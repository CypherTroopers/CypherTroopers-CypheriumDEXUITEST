import { useState } from 'react'
import { ethers } from 'ethers'
import { useTokens } from '../context/TokensContext'

export default function AddTokenForm() {
  const { tokens, addToken } = useTokens()
  const [symbol, setSymbol] = useState('')
  const [address, setAddress] = useState('')
  const [decimals, setDecimals] = useState(18)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ethers.isAddress(address)) {
      setError('Invalid Ethereum address')
      return
    }
    const exists = tokens.some(
      t => t.symbol === symbol || t.address.toLowerCase() === address.toLowerCase()
    )
    if (exists) {
      setError('Token symbol or address already exists')
      return
    }
    await addToken({ symbol, address, decimals: Number(decimals) })
    setSymbol('')
    setAddress('')
    setDecimals(18)
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h2>Add Token</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <input
          type="text"
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Decimals"
          value={decimals}
          onChange={(e) => setDecimals(parseInt(e.target.value))}
          required
        />
      </div>
      <button type="submit" style={{ marginTop: 10 }}>
        Add Token
      </button>
    </form>
  )
}

