import { useState } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { ensurePoolInitialized } from '../lib/addLiquidity'
import { UNISWAP_V3_FACTORY_ADDRESS } from '../lib/addresses'
import FactoryABI from '../abi/UniswapV3Factory.json'
import { useDexSettings } from '../context/DexSettingsContext'
import { usePools } from '../context/PoolsContext'

export default function CreatePoolForm() {
  const { provider } = useWallet()
  const { poolFee } = useDexSettings()
  const { addPool } = usePools()

  const [token0, setToken0] = useState('')
  const [token1, setToken1] = useState('')
  const [price, setPrice] = useState('1')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider) {
      setStatus('Wallet not connected')
      return
    }
    try {
      const signer = await provider.getSigner()
      setStatus('Creating pool...')
      await ensurePoolInitialized(signer, token0, token1, poolFee, Number(price))

      const factory = new ethers.Contract(
        UNISWAP_V3_FACTORY_ADDRESS,
        FactoryABI,
        provider
      )
      const poolAddr: string = await factory.getPool(token0, token1, poolFee)
      if (poolAddr && poolAddr !== ethers.ZeroAddress) {
        await addPool({ token0: token0.toLowerCase(), token1: token1.toLowerCase(), fee: poolFee, pool: poolAddr })
      }
      setStatus('✅ Pool created')
    } catch (err: any) {
      console.error(err)
      setStatus('❌ Error: ' + (err.message || String(err)))
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h2>Create Pool</h2>
      <input
        type="text"
        placeholder="Token0 address"
        value={token0}
        onChange={e => setToken0(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Token1 address"
        value={token1}
        onChange={e => setToken1(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Initial price token1/token0"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />
      <button type="submit">Create Pool</button>
      <p>{status}</p>
    </form>
  )
}
