// pages/pools.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AddLiquidityForm from '../components/AddLiquidityForm'
import { ethers } from 'ethers'
import NonfungiblePositionManagerABI from '../abi/NonfungiblePositionManager.json'
import { POSITION_MANAGER_ADDRESS } from '../lib/addresses'
import { removeLiquidity } from '../lib/removeLiquidity'

export default function PoolsPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [positions, setPositions] = useState<{ tokenId: number; liquidity: string; token0: string; token1: string }[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(browserProvider);
    }
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      if (!provider) return
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      if (!POSITION_MANAGER_ADDRESS) {
        throw new Error('POSITION_MANAGER_ADDRESS is not set');
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
      throw new Error('POSITION_MANAGER_ADDRESS is not set');
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
      list.push({ tokenId: Number(tId), liquidity: pos.liquidity.toString(), token0: pos.token0, token1: pos.token1 })
    }
    setPositions(list)
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

      <br />
      <Link href="/swap">← Back to Swap</Link>
    </main>
  );
}
