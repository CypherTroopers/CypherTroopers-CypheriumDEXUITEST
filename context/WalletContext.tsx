import { createContext, useContext, useState, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletContextValue {
  account: string
  provider?: ethers.BrowserProvider
  connectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState('')
  const [provider, setProvider] = useState<ethers.BrowserProvider>()

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return alert('MetaMaskが見つかりません')
    const prov = new ethers.BrowserProvider(ethereum)
    const signer = await prov.getSigner()
    const addr = await signer.getAddress()
    setProvider(prov)
    setAccount(addr)
  }

  return (
    <WalletContext.Provider value={{ account, provider, connectWallet }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
