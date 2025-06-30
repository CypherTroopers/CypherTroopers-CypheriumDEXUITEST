import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletContextValue {
  provider?: ethers.BrowserProvider
  address?: string
  connectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function WalletProvider({ children }: Props) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>()
  const [address, setAddress] = useState<string | undefined>()

  const connectWallet = async () => {
    if (!window.ethereum) return
    const prov = new ethers.BrowserProvider(window.ethereum)
    setProvider(prov)
    const accounts: string[] = await prov.send('eth_requestAccounts', [])
    if (accounts && accounts.length > 0) {
      setAddress(ethers.getAddress(accounts[0]))
    }
  }

  useEffect(() => {
    if (!window.ethereum) return
    const prov = new ethers.BrowserProvider(window.ethereum)
    setProvider(prov)
    prov.send('eth_accounts', []).then((accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAddress(ethers.getAddress(accounts[0]))
      }
    })
    const handler = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAddress(ethers.getAddress(accounts[0]))
      } else {
        setAddress(undefined)
      }
    }
    window.ethereum.on('accountsChanged', handler)
    return () => {
      window.ethereum.removeListener?.('accountsChanged', handler)
    }
  }, [])

  return (
    <WalletContext.Provider value={{ provider, address, connectWallet }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
