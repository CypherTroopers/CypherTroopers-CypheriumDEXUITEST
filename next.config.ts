import type { NextConfig } from "next"
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['https://dex.funoncypherium.org'],
  env: {
    NEXT_PUBLIC_WETH9_ADDRESS: process.env.NEXT_PUBLIC_WETH9_ADDRESS?.toLowerCase(),
    NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS?.toLowerCase(),
    NEXT_PUBLIC_SWAP_ROUTER_ADDRESS: process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS?.toLowerCase(),
    NEXT_PUBLIC_QUOTER_ADDRESS: process.env.NEXT_PUBLIC_QUOTER_ADDRESS?.toLowerCase(),
    NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS?.toLowerCase(),
    NEXT_PUBLIC_POSITION_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS?.toLowerCase(),
    NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS:
      (process.env.NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS ||
        process.env.NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS)?.toLowerCase(),
    NEXT_PUBLIC_TICK_LENS_ADDRESS: process.env.NEXT_PUBLIC_TICK_LENS_ADDRESS?.toLowerCase(),
    NEXT_PUBLIC_MULTICALL_ADDRESS: process.env.NEXT_PUBLIC_MULTICALL_ADDRESS?.toLowerCase(),
  }
}

export default nextConfig
