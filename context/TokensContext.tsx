import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TokenInfo, DEFAULT_TOKENS } from '../lib/tokens'

interface TokensContextValue {
  tokens: TokenInfo[]
  addToken: (token: TokenInfo) => void
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function TokensProvider({ children }: Props) {
  const [tokens, setTokens] = useState<TokenInfo[]>(DEFAULT_TOKENS)

  useEffect(() => {
    const stored = localStorage.getItem('userTokens')
    if (stored) {
      try {
        const parsed: TokenInfo[] = JSON.parse(stored)
        setTokens([...DEFAULT_TOKENS, ...parsed])
      } catch {
        setTokens(DEFAULT_TOKENS)
      }
    } else {
      setTokens(DEFAULT_TOKENS)
    }
  }, [])

  const addToken = (token: TokenInfo) => {
    setTokens(prev => [...prev, token])
    const stored = localStorage.getItem('userTokens')
    const userTokens: TokenInfo[] = stored ? JSON.parse(stored) : []
    userTokens.push(token)
    localStorage.setItem('userTokens', JSON.stringify(userTokens))
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

