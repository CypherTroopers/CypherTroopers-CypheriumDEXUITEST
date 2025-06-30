import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
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

  useEffect(() => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    ethereum
      .request({ method: 'eth_accounts' })
      .then(async (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          const prov = new ethers.BrowserProvider(ethereum)
          const signerObj = await prov.getSigner()
          const addr = await signerObj.getAddress()
          setProvider(prov)
          setSigner(signerObj)
          setAccount(addr)
        }
      })
      .catch((err: any) => console.error(err))
  }, [])

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
