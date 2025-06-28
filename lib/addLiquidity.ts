// lib/addLiquidity.ts
import { Contract } from 'ethers'
import NonfungiblePositionManagerABI from '../abi/NonfungiblePositionManager.json'
import { ethers } from 'ethers'
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk'

import { POSITION_MANAGER_ADDRESS } from './addresses'

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
  const positionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  )

  const sqrtPriceX96 = encodeSqrtRatioX96(
    Math.floor(price * 1e6).toString(),
    '1000000'
  )
  
  // ✅ hex に変換
  const sqrtPriceX96Hex = jsbiToHex(sqrtPriceX96);

  try {
    const tx = await positionManager.createAndInitializePoolIfNecessary(
      token0,
      token1,
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
  const positionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  );

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const amount0Min = BigInt(amount0Desired) * BigInt(1000 - slippage * 10) / BigInt(1000);
  const amount1Min = BigInt(amount1Desired) * BigInt(1000 - slippage * 10) / BigInt(1000);

  const tx = await positionManager.mint({
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    amount0Desired,
    amount1Desired,
    amount0Min: amount0Min.toString(),
    amount1Min: amount1Min.toString(),
    recipient: await signer.getAddress(),
    deadline
  });

  return tx.wait();
}
