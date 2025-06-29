import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TokenInfo, DEFAULT_TOKENS } from '../lib/tokens'

interface TokensContextValue {
  tokens: TokenInfo[]
  addToken: (token: TokenInfo) => Promise<void>
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function TokensProvider({ children }: Props) {
  const [tokens, setTokens] = useState<TokenInfo[]>(DEFAULT_TOKENS)
	
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens')
        if (res.ok) {
          const data: TokenInfo[] = await res.json()
          setTokens(data.length > 0 ? data : DEFAULT_TOKENS)
        } else {
          setTokens(DEFAULT_TOKENS)
        }
      } catch {
        setTokens(DEFAULT_TOKENS)
      }
    }
    fetchTokens()
  }, [])

  const addToken = async (token: TokenInfo) => {
    setTokens(prev => [...prev, token])
    try {
      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token)
      })
    } catch {
      // ignore
    }
  }

  return (
    <TokensContext.Provider value={{ tokens, addToken }}>
      {children}
    </TokensContext.Provider>
  )
}

export function useTokens() {
  const ctx = useContext(TokensContext)
  if (!ctx) throw new Error('useTokens must be used within TokensProvider')
  return ctx
}

