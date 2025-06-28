import { ethers } from 'ethers'
import { TokenInfo } from './tokens'

import { QUOTER_ADDRESS } from './addresses'

const ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
]

export async function fetchQuote(
  provider: ethers.Provider,
  fromToken: TokenInfo,
  toToken: TokenInfo,
  amountIn: string
): Promise<string> {
  const quoter = new ethers.Contract(QUOTER_ADDRESS, ABI, provider)

  const amountInRaw = ethers.parseUnits(amountIn, fromToken.decimals)
  const fee = 3000 // 0.3% 決め打ち（後で動的に設定可能）

  const { amountOut } = await quoter.quoteExactInputSingle(
    fromToken.address,
    toToken.address,
    fee,
    amountInRaw,
    0
  )

  return ethers.formatUnits(amountOut, toToken.decimals)
}
