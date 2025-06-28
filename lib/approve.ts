import { ethers } from 'ethers'
import ERC20ABI from './abis/ERC20.json'

export async function approveToken(
  provider: ethers.BrowserProvider,
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
) {
  const signer = await provider.getSigner()
  const erc20 = new ethers.Contract(tokenAddress, ERC20ABI, signer)
  const decimals = await erc20.decimals()
  const parsedAmount = ethers.parseUnits(amount, decimals)
  const tx = await erc20.approve(spenderAddress, parsedAmount)
  return tx.wait()
}
