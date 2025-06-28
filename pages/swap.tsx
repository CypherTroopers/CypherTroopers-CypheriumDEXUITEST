'use client'
import { useEffect, useState } from 'react'
import { TokenInfo } from '../lib/tokens'
import { useTokens } from '../context/TokensContext'
import { fetchQuote } from '../lib/fetchQuote'
import { approveToken } from '../lib/approve'
import { executeSwap } from '../lib/executeSwap'
import { SWAP_ROUTER_ADDRESS } from '../lib/addresses'
import { useDexSettings } from '../context/DexSettingsContext'
import { useWallet } from '../context/WalletContext'

export default function Home() {
  const { tokens } = useTokens()
  const { poolFee } = useDexSettings()
  const { provider, signer, account, connectWallet } = useWallet()
  const [fromToken, setFromToken] = useState<TokenInfo>(tokens[0])
  const [toToken, setToToken] = useState<TokenInfo>(tokens[1])
  const [amountIn, setAmountIn] = useState('')
  const [quotedAmountOut, setQuotedAmountOut] = useState('')

  useEffect(() => {
    if (tokens.length > 0) setFromToken(tokens[0])
    if (tokens.length > 1) setToToken(tokens[1])
  }, [tokens])

  useEffect(() => {
    connectWallet()
  }, [])

  const handleApprove = async () => {
    if (!provider || !amountIn) return
    await approveToken(provider, fromToken.address, SWAP_ROUTER_ADDRESS, amountIn)
  }

  const handleSwap = async () => {
    if (!signer || !amountIn) return
    await executeSwap(signer, fromToken, toToken, amountIn, poolFee)
  }

  // fetchQuote を呼び出して amountOut を表示
  useEffect(() => {
    const getQuote = async () => {
      if (!provider || !amountIn || !fromToken || !toToken) return
      try {
        const amountOut = await fetchQuote(provider, fromToken, toToken, amountIn, poolFee)
        setQuotedAmountOut(amountOut)
      } catch (err) {
        setQuotedAmountOut('failed')
      }
    }
    getQuote()
  }, [amountIn, fromToken, toToken, provider, poolFee])

  return (
    <main style={{ padding: 20 }}>
      <h1>Cypherium DEX</h1>
      <div>Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '未接続'}</div>

      <div style={{ marginTop: 30 }}>
        <div>
          <label>From:</label>
          <select
            value={fromToken.symbol}
            onChange={(e) => {
              const token = tokens.find(t => t.symbol === e.target.value)
              if (token) setFromToken(token)
            }}
          >
            {tokens.map(t => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="Amount"
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>To:</label>
          <select
            value={toToken.symbol}
            onChange={(e) => {
              const token = tokens.find(t => t.symbol === e.target.value)
              if (token) setToToken(token)
            }}
          >
            {tokens.map(t => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Expected Output:</label>
          <div>{quotedAmountOut ? `${quotedAmountOut} ${toToken.symbol}` : '-'}</div>
        </div>

        <button style={{ marginTop: 20 }} onClick={handleApprove}>
          Approve
        </button>

        <button style={{ marginTop: 10 }} onClick={handleSwap}>
          Swap
        </button>
      </div>
    </main>
  )
}

