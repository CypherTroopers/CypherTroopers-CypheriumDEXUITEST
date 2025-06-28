// lib/tickMath.ts
import { TickMath } from '@uniswap/v3-sdk';
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { BigintIsh } from '@uniswap/sdk-core';

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
