import { ethers } from 'ethers'
import { TokenInfo } from './tokens'

import { getAddress } from './addresses'

const QUOTER_ADDRESS = getAddress('NEXT_PUBLIC_QUOTER_ADDRESS')

const ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
]

export async function fetchQuote(
  provider: ethers.Provider,
  fromToken: TokenInfo,
  toToken: TokenInfo,
  amountIn: string,
  fee: number
): Promise<string> {
  const quoter = new ethers.Contract(QUOTER_ADDRESS, ABI, provider)

  const amountInRaw = ethers.parseUnits(amountIn, fromToken.decimals)

  const { amountOut } = await quoter.quoteExactInputSingle(
    fromToken.address,
    toToken.address,
    fee,
    amountInRaw,
    0
  )

  return ethers.formatUnits(amountOut, toToken.decimals)
}
