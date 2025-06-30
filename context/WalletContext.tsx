import { createContext, useContext, useState, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletContextValue {
  account: string
  provider?: ethers.BrowserProvider
  signer?: ethers.JsonRpcSigner
  connectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState('')
  const [provider, setProvider] = useState<ethers.BrowserProvider>()
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>()

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return alert('MetaMaskが見つかりません')
        try {
      await ethereum.request({ method: 'eth_requestAccounts' })
    } catch (err) {
      console.error(err)
      return
    }
    const prov = new ethers.BrowserProvider(ethereum)
    const signerObj = await prov.getSigner()
    const addr = await signerObj.getAddress()
    setProvider(prov)
    setSigner(signerObj)
    setAccount(addr)
  }

  return (
    <WalletContext.Provider value={{ account, provider, signer, connectWallet }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
