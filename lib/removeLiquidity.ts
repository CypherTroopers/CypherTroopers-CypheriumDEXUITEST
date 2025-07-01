import { Contract, MaxUint256 } from 'ethers'
import { ethers } from 'ethers'
import NonfungiblePositionManagerABI from '../abi/NonfungiblePositionManager.json'
import { getAddress } from './addresses'

const POSITION_MANAGER_ADDRESS = getAddress('NEXT_PUBLIC_POSITION_MANAGER_ADDRESS')

export async function removeLiquidity(
  signer: ethers.Signer,
  tokenId: number,
  liquidity: string
) {
  if (!POSITION_MANAGER_ADDRESS) {
    throw new Error('POSITION_MANAGER_ADDRESS is not set');
  }
  const manager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  )

  const latestBlock = await signer.provider?.getBlock('latest')
  const currentTimestamp = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000)
  const deadline = currentTimestamp + 60 * 10
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
