import { Contract, MaxUint256 } from 'ethers'
import { ethers } from 'ethers'
import NonfungiblePositionManagerABI from '../abi/NonfungiblePositionManager.json'
import { POSITION_MANAGER_ADDRESS } from './addresses'

export async function removeLiquidity(
  signer: ethers.Signer,
  tokenId: number,
  liquidity: string
) {
  const manager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  )

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10
  const params = {
    tokenId,
    liquidity,
    amount0Min: 0,
    amount1Min: 0,
    deadline
  }

  const tx = await manager.decreaseLiquidity(params)
  await tx.wait()

  const collectParams = {
    tokenId,
    recipient: await signer.getAddress(),
    amount0Max: MaxUint256,
    amount1Max: MaxUint256
  }

  const tx2 = await manager.collect(collectParams)
  return tx2.wait()
}
