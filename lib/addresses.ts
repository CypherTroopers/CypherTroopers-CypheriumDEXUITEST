export const WETH9_ADDRESS = (process.env.NEXT_PUBLIC_WETH9_ADDRESS as string).toLowerCase()
export const UNISWAP_V3_FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS as string).toLowerCase()
export const SWAP_ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS as string).toLowerCase()
export const QUOTER_ADDRESS = (process.env.NEXT_PUBLIC_QUOTER_ADDRESS as string).toLowerCase()
export const TOKEN_DESCRIPTOR_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS as string).toLowerCase()
export const POSITION_MANAGER_ADDRESS = (process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as string).toLowerCase()
export const POOL_DEPLOYER_ADDRESS = (
  process.env.NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS ||
  process.env.NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS
)!.toLowerCase()
export const TICK_LENS_ADDRESS = (process.env.NEXT_PUBLIC_TICK_LENS_ADDRESS as string).toLowerCase()
export const MULTICALL_ADDRESS = (process.env.NEXT_PUBLIC_MULTICALL_ADDRESS as string).toLowerCase()
