  const { t } = useTranslation('common')
  const transactions = [
    { id: 1, token: 'TestToken', amount: '100', type: 'swap' },
    { id: 2, token: 'WCPH', amount: '50', type: 'add-liquidity' },
  ]
  return (
    <main style={{ padding: 20 }}>
      <h1>{t('dashboardTitle')}</h1>
      <h2>{t('pastTransactions')}</h2>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>{tx.type}: {tx.amount} {tx.token}</li>
        ))}
      </ul>
      <h2>{t('poolMetrics')}</h2>
      <p>TVL: 12345</p>
      <p>Volume 24h: 678</p>
    </main>
  )
}
