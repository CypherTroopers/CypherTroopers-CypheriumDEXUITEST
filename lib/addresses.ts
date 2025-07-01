const ENV_ADDRESSES = {
  NEXT_PUBLIC_WETH9_ADDRESS: process.env.NEXT_PUBLIC_WETH9_ADDRESS,
  NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS,
  NEXT_PUBLIC_SWAP_ROUTER_ADDRESS: process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS,
  NEXT_PUBLIC_QUOTER_ADDRESS: process.env.NEXT_PUBLIC_QUOTER_ADDRESS,
  NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS,
  NEXT_PUBLIC_POSITION_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS,
  NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS: process.env.NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS,
  NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS: process.env.NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS,
  NEXT_PUBLIC_TICK_LENS_ADDRESS: process.env.NEXT_PUBLIC_TICK_LENS_ADDRESS,
  NEXT_PUBLIC_MULTICALL_ADDRESS: process.env.NEXT_PUBLIC_MULTICALL_ADDRESS,
} as const

type AddressKey = keyof typeof ENV_ADDRESSES

export function getAddress(name: AddressKey): string {
  const value = ENV_ADDRESSES[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value.toLowerCase()
}

export function getOptionalAddress(name: AddressKey): string | undefined {
  const value = ENV_ADDRESSES[name]
  return value ? value.toLowerCase() : undefined
}

export function validateAddresses() {
  void (
    getAddress('NEXT_PUBLIC_WETH9_ADDRESS') &&
    getAddress('NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS') &&
    getAddress('NEXT_PUBLIC_SWAP_ROUTER_ADDRESS') &&
    getAddress('NEXT_PUBLIC_QUOTER_ADDRESS') &&
    getAddress('NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS') &&
    getAddress('NEXT_PUBLIC_POSITION_MANAGER_ADDRESS') &&
    (
      getOptionalAddress('NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS') ||
      getOptionalAddress('NEXT_PUBLIC_POOL_DEPLOYER_ADDRESS')
    ) &&
    getAddress('NEXT_PUBLIC_TICK_LENS_ADDRESS') &&
    getAddress('NEXT_PUBLIC_MULTICALL_ADDRESS')
  )
}
