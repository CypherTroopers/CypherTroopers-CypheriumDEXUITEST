// lib/addLiquidity.ts
import { Contract } from 'ethers'
import NonfungiblePositionManagerABIJson from '../abi/NonfungiblePositionManager.json';
import { ethers } from 'ethers'
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk'

import { POSITION_MANAGER_ADDRESS } from './addresses'

const NonfungiblePositionManagerABI =
  (NonfungiblePositionManagerABIJson as any).default || NonfungiblePositionManagerABIJson;
/**
 * token のアドレスをソートし、対応する数量も並び替える
 */
function sortTokens(
  tokenA: string,
  tokenB: string,
  amountADesired: string,
  amountBDesired: string
) {
  if (BigInt(tokenA.toLowerCase()) < BigInt(tokenB.toLowerCase())) {
    return {
      token0: tokenA,
      token1: tokenB,
      amount0Desired: amountADesired,
      amount1Desired: amountBDesired,
    }
  }
  return {
    token0: tokenB,
    token1: tokenA,
    amount0Desired: amountBDesired,
    amount1Desired: amountADesired,
  }
}

/**
 * encodeSqrtRatioX96 の結果(JSBI)を hex string に変換する
 */
function jsbiToHex(jsbiValue: any): string {
  const hex = jsbiValue.toString(16);
  return '0x' + hex.padStart(32, '0');
}

/**
 * token ペアのプールを作成して初期化
 */
export async function ensurePoolInitialized(
  signer: ethers.Signer,
  token0: string,
  token1: string,
  fee: number,
  price: number
) {
  if (!POSITION_MANAGER_ADDRESS) {
    throw new Error('POSITION_MANAGER_ADDRESS is not set');
  }
  const sorted = sortTokens(token0, token1, '0', '0')
  const finalPrice = sorted.token0 === token0 ? price : 1 / price
  const positionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  )

  const sqrtPriceX96 = encodeSqrtRatioX96(
    Math.floor(finalPrice * 1e6).toString(),
    '1000000'
  )

  // ✅ hex に変換
  const sqrtPriceX96Hex = jsbiToHex(sqrtPriceX96);

  try {
    const tx = await positionManager.createAndInitializePoolIfNecessary(
      sorted.token0,
      sorted.token1,
      fee,
      sqrtPriceX96Hex
    )
    await tx.wait()
  } catch (err: any) {
    const msg = err?.message ?? ''
    if (msg.includes('already') && (msg.includes('initialized') || msg.includes('exists'))) {
      return
    }
    throw err
  }
}

/**
 * addLiquidity
 * Uniswap V3 に流動性を追加（新規ポジション作成）
 */
export async function addLiquidity(
  signer: ethers.Signer,
  token0: string,
  token1: string,
  fee: number,                  // 例: 3000
  tickLower: number,
  tickUpper: number,
  amount0Desired: string,      // 例: '1000000000000000000' (1.0 Token)
  amount1Desired: string,
  slippage: number             // 例: 0.5 (%)
) {
  const sorted = sortTokens(token0, token1, amount0Desired, amount1Desired)
  const finalTickLower = sorted.token0 === token0 ? tickLower : -tickUpper
  const finalTickUpper = sorted.token0 === token0 ? tickUpper : -tickLower
  if (!POSITION_MANAGER_ADDRESS) {
    throw new Error('POSITION_MANAGER_ADDRESS is not set');
  }
  const positionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  );

  const latestBlock = await signer.provider?.getBlock('latest')
  const currentTimestamp = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000)
  const deadline = currentTimestamp + 60 * 10

  const amount0Min = BigInt(sorted.amount0Desired) * BigInt(1000 - slippage * 10) / BigInt(1000)
  const amount1Min = BigInt(sorted.amount1Desired) * BigInt(1000 - slippage * 10) / BigInt(1000)
  const recipient = await signer.getAddress()
  const params = {
    token0: sorted.token0,
    token1: sorted.token1,
    fee,
    tickLower: finalTickLower,
    tickUpper: finalTickUpper,
    amount0Desired: sorted.amount0Desired,
    amount1Desired: sorted.amount1Desired,
    amount0Min: amount0Min.toString(),
    amount1Min: amount1Min.toString(),
    recipient,
    deadline
  }

// Use staticCall to detect reverts and surface error messages
  try {
    await positionManager.mint.staticCall(params)
  } catch (err: any) {
    const errorMsg = err?.shortMessage || err?.message || String(err)
    if (errorMsg.includes('missing revert data')) {
      console.warn('mint.staticCall failed with missing revert data, proceeding')
    } else {
      throw new Error(errorMsg)
    }
  }

  const tx = await positionManager.mint(params)

  return tx
}

