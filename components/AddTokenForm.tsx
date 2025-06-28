import { useState } from 'react'
import { useTokens } from '../context/TokensContext'

export default function AddTokenForm() {
  const { addToken } = useTokens()
  const [symbol, setSymbol] = useState('')
  const [address, setAddress] = useState('')
  const [decimals, setDecimals] = useState(18)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addToken({ symbol, address, decimals: Number(decimals) })
    setSymbol('')
    setAddress('')
    setDecimals(18)
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h2>Add Token</h2>
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

