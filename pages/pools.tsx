// pages/pools.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AddLiquidityForm from '../components/AddLiquidityForm'
import { ethers } from 'ethers'
import NonfungiblePositionManagerABI from '../abi/NonfungiblePositionManager.json'
import { POSITION_MANAGER_ADDRESS } from '../lib/addresses'
import { removeLiquidity } from '../lib/removeLiquidity'
import { fetchPools, PoolInfo } from '../lib/fetchPools'
import { useTokens } from '../context/TokensContext'
import { usePools } from '../context/PoolsContext'
import { addLiquidity } from '../lib/addLiquidity'
import { useWalletClient } from 'wagmi'

// ERC20 approve 用の ABI
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
]

  const computeDefaultPrice = (lower: number, upper: number) => {
    const midTick = (lower + upper) / 2
    return Math.pow(1.0001, midTick)
  }

export default function PoolsPage() {
  const { data: walletClient } = useWalletClient()
  const provider = walletClient
    ? new ethers.BrowserProvider(walletClient.transport)
    : undefined
  const [positions, setPositions] = useState<{ tokenId: number; liquidity: string; token0: string; token1: string }[]>([])
  const { tokens } = useTokens()
  const { pools, addPool } = usePools()
  const [searchAddress, setSearchAddress] = useState('')
  const [foundPools, setFoundPools] = useState<PoolInfo[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const fetchPositions = async () => {
      if (!provider) return
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      if (!POSITION_MANAGER_ADDRESS) {
        throw new Error('POSITION_MANAGER_ADDRESS is not set')
      }
      const manager = new ethers.Contract(
        POSITION_MANAGER_ADDRESS,
        NonfungiblePositionManagerABI,
        provider
      )
      const balance: bigint = await manager.balanceOf(address)
      const list = [] as { tokenId: number; liquidity: string; token0: string; token1: string }[]
      for (let i = 0; i < Number(balance); i++) {
        const tokenId: bigint = await manager.tokenOfOwnerByIndex(address, i)
        const pos = await manager.positions(tokenId)
        list.push({
          tokenId: Number(tokenId),
          liquidity: pos.liquidity.toString(),
          token0: pos.token0,
          token1: pos.token1
        })
      }
      setPositions(list)
    }
    fetchPositions()
  }, [provider])

  const handleRemove = async (tokenId: number, liquidity: string) => {
    if (!provider) return
    const signer = await provider.getSigner()
    await removeLiquidity(signer, tokenId, liquidity)
    // refresh positions
    if (!POSITION_MANAGER_ADDRESS) {
      throw new Error('POSITION_MANAGER_ADDRESS is not set')
    }
    const manager = new ethers.Contract(
      POSITION_MANAGER_ADDRESS,
      NonfungiblePositionManagerABI,
      provider
    )
    const address = await signer.getAddress()
    const balance: bigint = await manager.balanceOf(address)
    const list = [] as { tokenId: number; liquidity: string; token0: string; token1: string }[]
    for (let i = 0; i < Number(balance); i++) {
      const tId: bigint = await manager.tokenOfOwnerByIndex(address, i)
      const pos = await manager.positions(tId)
      list.push({
        tokenId: Number(tId),
        liquidity: pos.liquidity.toString(),
        token0: pos.token0,
        token1: pos.token1
      })
    }
    setPositions(list)
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
      pools.forEach(p => {
        addPool({ token0: searchAddress, token1: p.token.address, fee: p.fee, pool: p.pool })
      })
    } catch (err) {
      console.error(err)
      setFoundPools([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Pools</h1>
      {positions.length > 0 && (
        <div>
          <h2>Your Positions</h2>
          <ul>
            {positions.map(p => (
              <li key={p.tokenId} style={{ marginBottom: 10 }}>
                ID: {p.tokenId} - {p.token0}/{p.token1} - Liquidity: {p.liquidity}
                <button style={{ marginLeft: 10 }} onClick={() => handleRemove(p.tokenId, p.liquidity)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ marginTop: 20 }}>Add Liquidity</p>

      {provider ? (
        <AddLiquidityForm provider={provider} />
      ) : (
        <p>🦊 MetaMask に接続してください。</p>
      )}

      <div style={{ marginTop: 30 }}>
        <h2>Find Pools</h2>
        <form onSubmit={handleSearchPools} style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="ERC20 address"
            value={searchAddress}
            onChange={e => setSearchAddress(e.target.value)}
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

      {pools.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Known Pools</h2>
          <ul>
            {pools.map((p, i) => (
              <li key={i}>
                {p.token0}/{p.token1} (fee {p.fee}) - {p.pool}
              </li>
            ))}
          </ul>
        </div>
      )}

      <br />
      <Link href="/swap">← Back to Swap</Link>
    </main>
  )
}
