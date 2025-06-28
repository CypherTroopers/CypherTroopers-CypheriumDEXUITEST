import Link from 'next/link'
import { useTokens } from '../context/TokensContext'
import AddTokenForm from '../components/AddTokenForm'

export default function TokensPage() {
  const { tokens } = useTokens()
  return (
    <main style={{ padding: 20 }}>
      <h1>Tokens</h1>
      <ul>
        {tokens.map(t => (
          <li key={t.symbol}>{t.symbol} - {t.address} - {t.decimals}</li>
        ))}
      </ul>
      <AddTokenForm />
      <Link href="/swap">← Back to Swap</Link>
    </main>
  )
}
