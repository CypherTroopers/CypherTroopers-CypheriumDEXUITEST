import { ethers } from 'ethers'
import { TokenInfo } from './tokens'
import { SWAP_ROUTER_ADDRESS } from './addresses'
import SWAP_ROUTER_ABI from './abis/SwapRouter.json'

export async function executeSwap(
  signer: ethers.JsonRpcSigner,
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  amountIn: string,
  fee: number
) {
  const router = new ethers.Contract(SWAP_ROUTER_ADDRESS, SWAP_ROUTER_ABI, signer)

  const latestBlock = await signer.provider?.getBlock('latest')
  const currentTimestamp = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000)
  const deadline = currentTimestamp + 60 * 10

  const params = {
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    fee,
    recipient: await signer.getAddress(),
    deadline,
    amountIn: ethers.parseUnits(amountIn, tokenIn.decimals),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  }

  const tx = await router.exactInputSingle(params)
  return tx.wait()
}
