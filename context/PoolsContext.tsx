import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface PoolInfoStored {
  token0: string
  token1: string
  fee: number
  pool: string
}

interface PoolsContextValue {
  pools: PoolInfoStored[]
  addPool: (pool: PoolInfoStored) => Promise<void>
  removePool: (poolAddress: string) => Promise<void>
}

const PoolsContext = createContext<PoolsContextValue | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function PoolsProvider({ children }: Props) {
  const [pools, setPools] = useState<PoolInfoStored[]>([])

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const res = await fetch('/api/pools')
        if (res.ok) {
          const data: PoolInfoStored[] = await res.json()
          setPools(data)
        }
      } catch {
        // ignore
      }
    }
    fetchPools()
  }, [])

  const addPool = async (pool: PoolInfoStored) => {
    setPools(prev => [...prev, pool])
    try {
      await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pool)
      })
    } catch {
      // ignore
    }
  }
  const removePool = async (poolAddress: string) => {
    setPools(prev => prev.filter(p => p.pool.toLowerCase() !== poolAddress.toLowerCase()))
    try {
      const params = new URLSearchParams({ pool: poolAddress })
      await fetch(`/api/pools?${params.toString()}`, { method: 'DELETE' })
    } catch {
      // ignore
    }
  }

  return (
    <PoolsContext.Provider value={{ pools, addPool, removePool }}>
      {children}
    </PoolsContext.Provider>
  )
}

export function usePools() {
  const ctx = useContext(PoolsContext)
  if (!ctx) throw new Error('usePools must be used within PoolsProvider')
  return ctx
}
