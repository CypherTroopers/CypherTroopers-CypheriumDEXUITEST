// lib/addLiquidity.ts

import { Contract, parseUnits } from 'ethers'
import NonfungiblePositionManagerABIJson from '../abi/NonfungiblePositionManager.json'
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
import { POSITION_MANAGER_ADDRESS } from './addresses'

const NonfungiblePositionManagerABI =
  (NonfungiblePositionManagerABIJson as any).default || NonfungiblePositionManagerABIJson

/**
 * token のアドレスをソートし、対応する数量も並び替える
 */
function sortTokens(
  tokenA: string,
  tokenB: string,
  amountADesired: string,
  amountBDesired: string
) {
  if (tokenA.toLowerCase() < tokenB.toLowerCase()) {
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
function jsbiToHex(jsbiValue: JSBI): string {
  const hex = jsbiValue.toString(16)
  return '0x' + hex.padStart(32, '0')
}

/**
 * token ペアのプールを作成して初期化する
 */
export async function ensurePoolInitialized(
  signer: any,
  token0: string,
  token1: string,
  fee: number,
  price: number
) {
  if (!POSITION_MANAGER_ADDRESS) {
    throw new Error('POSITION_MANAGER_ADDRESS is not set')
  }

  const sorted = sortTokens(token0, token1, '0', '0')
  const finalPrice = sorted.token0 === token0 ? price : 1 / price

  const numerator = JSBI.BigInt(Math.floor(finalPrice * 1e6))
  const denominator = JSBI.BigInt(1_000_000)

  const sqrtPriceX96 = encodeSqrtRatioX96(numerator, denominator)
  const sqrtPriceX96Hex = jsbiToHex(sqrtPriceX96)

  const positionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  )

  const fn = positionManager.getFunction('createAndInitializePoolIfNecessary')

  try {
    await fn.staticCall(
      sorted.token0,
      sorted.token1,
      fee,
      sqrtPriceX96Hex
    )
  } catch (err: any) {
    const msg = err?.shortMessage || err?.message || String(err)
    // Log arguments for easier debugging when the static call fails
    console.error(
      `createAndInitializePoolIfNecessary.staticCall failed`,
      {
        token0,
        token1,
        fee,
        price: finalPrice,
      }
    )
    // Known failure cases:
    // 1. missing revert data - the contract reverted without a message.
    // 2. pool already initialized or exists.
    if (msg.includes('missing revert data')) {
      console.warn('createAndInitializePoolIfNecessary.staticCall missing revert data, continuing')
    } else if (msg.includes('already') && (msg.includes('initialized') || msg.includes('exists'))) {
      return
    } else {
      // Surface arguments so callers/UI can present them
      throw new Error(`Pool initialization failed: ${msg}. token0=${token0}, token1=${token1}, fee=${fee}, price=${finalPrice}`)
    }
  }

  const gasEstimate = await fn.estimateGas(
    sorted.token0,
    sorted.token1,
    fee,
    sqrtPriceX96Hex
  )

  const gasLimit = gasEstimate * 12n / 10n

  const tx = await fn.send(
    sorted.token0,
    sorted.token1,
    fee,
    sqrtPriceX96Hex,
    {
      gasLimit,
      gasPrice: parseUnits("50", "gwei"),
    }
  )
  await tx.wait()
}

/**
 * addLiquidity
 * Uniswap V3 に流動性を追加（新規ポジション作成）
 */
export async function addLiquidity(
  signer: any,
  token0: string,
  token1: string,
  fee: number,
  tickLower: number,
  tickUpper: number,
  amount0Desired: string,
  amount1Desired: string,
  slippage: number,
  price?: number
) {
  // 新規プールを作りたい場合は price を渡す
  if (price !== undefined) {
    console.log("Running ensurePoolInitialized ...")
    await ensurePoolInitialized(
      signer,
      token0,
      token1,
      fee,
      price
    )
  }

  const sorted = sortTokens(token0, token1, amount0Desired, amount1Desired)

  let lower = sorted.token0 === token0 ? tickLower : -tickUpper
  let upper = sorted.token0 === token0 ? tickUpper : -tickLower

  if (lower > upper) {
    [lower, upper] = [upper, lower]
  }

  if (!POSITION_MANAGER_ADDRESS) {
    throw new Error('POSITION_MANAGER_ADDRESS is not set')
  }

  const positionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManagerABI,
    signer
  )

  const latestBlock = await signer.provider.getBlock('latest')
  const currentTimestamp = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000)
  const deadline = currentTimestamp + 60 * 10

  const slippageFactor = BigInt(Math.floor((1 - slippage / 100) * 1_000_000))
  const amount0Min = BigInt(sorted.amount0Desired) * slippageFactor / BigInt(1_000_000)
  const amount1Min = BigInt(sorted.amount1Desired) * slippageFactor / BigInt(1_000_000)

  const recipient = await signer.getAddress()
  const params = {
    token0: sorted.token0,
    token1: sorted.token1,
    fee,
    tickLower: lower,
    tickUpper: upper,
    amount0Desired: sorted.amount0Desired,
    amount1Desired: sorted.amount1Desired,
    amount0Min: amount0Min.toString(),
    amount1Min: amount1Min.toString(),
    recipient,
    deadline
  }

  const mintFn = positionManager.getFunction('mint')

  try {
    await mintFn.staticCall(params)
  } catch (err: any) {
    const errorMsg = err?.shortMessage || err?.message || String(err)
    const code = (err as any)?.code || ''
    if (errorMsg.includes('missing revert data') || code === 'CALL_EXCEPTION') {
      console.warn('mint.staticCall failed with missing revert data, proceeding')
    } else {
      throw new Error(errorMsg)
    }
  }

  try {
    const gasEstimate = await mintFn.estimateGas(params)
    console.log("estimateGas:", gasEstimate.toString())
  } catch (err) {
    console.error("estimateGas failed:", err)
  }

  let tx
  try {
    const gasEstimate = await mintFn.estimateGas(params)
    const gasLimit = gasEstimate * 12n / 10n

    tx = await mintFn.send(params, {
      gasLimit,
      gasPrice: parseUnits("50", "gwei")
    })
    await tx.wait()
  } catch (err: any) {
    console.error("RAW ERROR OBJECT:", err)
    const errorMsg =
      err?.shortMessage ||
      err?.reason ||
      err?.message ||
      String(err)
    console.error("Extracted errorMsg:", errorMsg)

    if (errorMsg.includes("missing revert data") || errorMsg.includes("coalesce")) {
      console.error("mint revert params:", params)
      throw new Error(
        "mint reverted with missing revert data or could not coalesce error. Verify token addresses, pool initialization, and amounts"
      )
    }
    throw new Error(errorMsg)
  }

  return tx
}
