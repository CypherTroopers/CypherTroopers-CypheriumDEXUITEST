import { createContext, useContext, useState, ReactNode } from 'react'

interface DexSettingsContextValue {
  slippage: number
  poolFee: number
  setSlippage: (value: number) => void
  setPoolFee: (value: number) => void
}

const DexSettingsContext = createContext<DexSettingsContextValue | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function DexSettingsProvider({ children }: Props) {
  const [slippage, setSlippage] = useState<number>(0.5)
  const [poolFee, setPoolFee] = useState<number>(3000)

  return (
    <DexSettingsContext.Provider value={{ slippage, poolFee, setSlippage, setPoolFee }}>
      {children}
    </DexSettingsContext.Provider>
  )
}

export function useDexSettings() {
  const ctx = useContext(DexSettingsContext)
  if (!ctx) throw new Error('useDexSettings must be used within DexSettingsProvider')
  return ctx
}
