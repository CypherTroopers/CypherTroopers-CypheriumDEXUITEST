export function getAddress(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value.toLowerCase()
}

export function getOptionalAddress(name: string): string | undefined {
  const value = process.env[name]
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
