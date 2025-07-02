'use client'
import { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import { TokenInfo } from '../lib/tokens'
import { useTokens } from '../context/TokensContext'
import { usePools } from '../context/PoolsContext'
import { fetchPools, type PoolInfo } from '../lib/fetchPools'
import { fetchQuote } from '../lib/fetchQuote'
import { approveToken } from '../lib/approve'
import { executeSwap } from '../lib/executeSwap'
import { getAddress } from '../lib/addresses'

const SWAP_ROUTER_ADDRESS = getAddress('NEXT_PUBLIC_SWAP_ROUTER_ADDRESS')
import { useDexSettings } from '../context/DexSettingsContext'
import { useWallet } from '../context/WalletContext'

export default function Home() {
  const { tokens, addToken } = useTokens()
  const { pools, addPool } = usePools()
  const { poolFee } = useDexSettings()
  const { provider, address } = useWallet()

  const [fromToken, setFromToken] = useState<TokenInfo>(tokens[0])
  const [toToken, setToToken] = useState<TokenInfo>(tokens[1])
  const [amountIn, setAmountIn] = useState('')
  const [quotedAmountOut, setQuotedAmountOut] = useState('')
  const scannedRef = useRef<Set<string>>(new Set())
  const [searchAddress, setSearchAddress] = useState('')
  const [foundPools, setFoundPools] = useState<PoolInfo[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (tokens.length > 0) setFromToken(tokens[0])
    if (tokens.length > 1) setToToken(tokens[1])
  }, [tokens])

  useEffect(() => {
    const detectPools = async () => {
      if (!provider) return
      for (const t of tokens) {
        const addr = t.address.toLowerCase()
        if (scannedRef.current.has(addr)) continue
        scannedRef.current.add(addr)
        try {
          const pools = await fetchPools(provider, addr, tokens)
          for (const p of pools) {
            const exists = tokens.some(
              existing => existing.address.toLowerCase() === p.token.address.toLowerCase()
            )
            if (!exists) {
              addToken(p.token)
            }
          }
        } catch {
          // ignore errors for detection
        }
      }
    }
    detectPools()
  }, [provider, tokens])

  const handleApprove = async () => {
    if (!provider || !amountIn) return
    await approveToken(provider, fromToken.address, SWAP_ROUTER_ADDRESS, amountIn)
  }

  const handleSwap = async () => {
    if (!provider || !amountIn) return

    const signer = await provider.getSigner()
    if (!signer) return

    await executeSwap(signer, fromToken, toToken, amountIn, poolFee)
  }

  const handleSearchPools = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider) return
    if (!ethers.isAddress(searchAddress)) {
      setFoundPools([])
      return
    }
    setSearching(true)
    try {
      const pools = await fetchPools(provider, searchAddress, tokens)
      setFoundPools(pools)
    } catch {
      setFoundPools([])
    } finally {
      setSearching(false)
    }
  }

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
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 20,
        flexDirection: 'column',
      }}
    >
      <h1>Cypherium DEX</h1>
      <div>
        Connected: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '未接続'}
      </div>

      <div style={{ marginTop: 30 }}>
        <div>
          <label>From:</label>
      
           <select
            value={fromToken.symbol}
            onChange={(e) => {
              const token = tokens.find((t) => t.symbol === e.target.value)
              if (token) setFromToken(token)
            }}
          >
            {tokens.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
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
              const token = tokens.find((t) => t.symbol === e.target.value)
              if (token) setToToken(token)
            }}
          >
            {tokens.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
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

        <div style={{ marginTop: 30 }}>
          <h2>Find Pools</h2>
          <form onSubmit={handleSearchPools} style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="ERC20 address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              style={{ marginRight: 10 }}
            />
            <button type="submit">Search</button>
          </form>
          {searching && <p>Searching...</p>}
          {foundPools.length > 0 ? (
            <ul>
              {foundPools.map((p, i) => (
                <li key={i}>
                  {searchAddress} / {p.token.symbol} (fee {p.fee}) - {p.pool}
                </li>
              ))}
            </ul>
          ) : (
            !searching && searchAddress && <p>No pools found</p>
          )}
        </div>
      </div>
    </main>
  )
}
