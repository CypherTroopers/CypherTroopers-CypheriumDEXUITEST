import { ethers } from 'ethers'
import { getAddress } from './addresses'

const UNISWAP_V3_FACTORY_ADDRESS = getAddress('NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS')
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
