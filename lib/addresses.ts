function requireAddress(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value.toLowerCase()
}

export const WETH9_ADDRESS = requireAddress('NEXT_PUBLIC_WETH9_ADDRESS')
export const UNISWAP_V3_FACTORY_ADDRESS = requireAddress('NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS')
export const SWAP_ROUTER_ADDRESS = requireAddress('NEXT_PUBLIC_SWAP_ROUTER_ADDRESS')
export const QUOTER_ADDRESS = requireAddress('NEXT_PUBLIC_QUOTER_ADDRESS')
export const TOKEN_DESCRIPTOR_ADDRESS = requireAddress('NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS')
export const POSITION_MANAGER_ADDRESS = requireAddress('NEXT_PUBLIC_POSITION_MANAGER_ADDRESS')
export const POOL_DEPLOYER_ADDRESS = (() => {
  const value =
    process.env.NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS ||
    process.env.NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS
  if (!value) {
    throw new Error(
      'Either NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS or NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS is required',
    )
  }
  return value.toLowerCase()
})()
export const TICK_LENS_ADDRESS = requireAddress('NEXT_PUBLIC_TICK_LENS_ADDRESS')
export const MULTICALL_ADDRESS = requireAddress('NEXT_PUBLIC_MULTICALL_ADDRESS')

export function validateAddresses() {
  // Access all constants so that missing variables throw immediately
  void (
    WETH9_ADDRESS &&
    UNISWAP_V3_FACTORY_ADDRESS &&
    SWAP_ROUTER_ADDRESS &&
    QUOTER_ADDRESS &&
    TOKEN_DESCRIPTOR_ADDRESS &&
    POSITION_MANAGER_ADDRESS &&
    POOL_DEPLOYER_ADDRESS &&
    TICK_LENS_ADDRESS &&
    MULTICALL_ADDRESS
  )
}
