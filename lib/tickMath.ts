// lib/tickMath.ts
import { TickMath } from '@uniswap/v3-sdk'
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'
import { BigintIsh } from '@uniswap/sdk-core'

// fee tiers and their corresponding tick spacing values
const FEE_TICK_SPACING: Record<number, number> = {
  100: 1,
  500: 10,
  3000: 60,
  10000: 200,
}

/**
 * 与えられた tick 値をプールで利用可能な最も近い tick に丸める
 */
export function nearestUsableTick(tick: number, fee: number): number {
  const spacing = FEE_TICK_SPACING[fee] ?? 1
  return Math.floor(tick / spacing) * spacing
}

/**
 * 価格 (token1/token0) に基づいて tick 値を取得
 */
export function getTickFromPrice(price: number): number {
  const sqrtRatioX96 = encodeSqrtRatioX96(
    Math.floor(price * 1e6).toString(),
    '1000000'
  );
  const tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96);
  return tick;
}
