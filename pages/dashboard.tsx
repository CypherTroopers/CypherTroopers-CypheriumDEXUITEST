export default function Dashboard() {
  const transactions = [
    { id: 1, token: 'TestToken', amount: '100', type: 'swap' },
    { id: 2, token: 'WCPH', amount: '50', type: 'add-liquidity' },
  ]
  return (
    <main style={{ padding: 20 }}>
            <h1>Dashboard</h1>
      <h2>Past Transactions</h2>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>{tx.type}: {tx.amount} {tx.token}</li>
        ))}
      </ul>
      <h2>Pool Metrics</h2>
      <p>TVL: 12345</p>
      <p>Volume 24h: 678</p>
    </main>
  )
}
