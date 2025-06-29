import { ethers } from 'ethers'
import { UNISWAP_V3_FACTORY_ADDRESS } from './addresses'
import { TokenInfo } from './tokens'

const FACTORY_ABI = [
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)'
]

export interface PoolInfo {
  token: TokenInfo
  fee: number
  pool: string
}

export async function fetchPools(
  provider: ethers.Provider,
  tokenAddress: string,
  tokens: TokenInfo[]
): Promise<PoolInfo[]> {
  if (!UNISWAP_V3_FACTORY_ADDRESS) {
    throw new Error('UNISWAP_V3_FACTORY_ADDRESS is not set')
  }
  const factory = new ethers.Contract(
    UNISWAP_V3_FACTORY_ADDRESS,
    FACTORY_ABI,
    provider
  )
  const fees = [500, 3000, 10000]
  const result: PoolInfo[] = []
  for (const t of tokens) {
    if (t.address.toLowerCase() === tokenAddress.toLowerCase()) continue
    for (const fee of fees) {
      const pool: string = await factory.getPool(tokenAddress, t.address, fee)
      if (pool && pool !== ethers.ZeroAddress) {
        result.push({ token: t, fee, pool })
      }
    }
  }
  return result
}
