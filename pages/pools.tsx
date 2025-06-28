// pages/pools.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AddLiquidityForm from '../components/AddLiquidityForm';
import { ethers } from 'ethers';

export default function PoolsPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(browserProvider);
    }
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Pools</h1>
      <p>This is where the pool list and liquidity addition UI will be placed.</p>

      {provider ? (
        <AddLiquidityForm provider={provider} />
      ) : (
        <p>🦊 MetaMask に接続してください。</p>
      )}

      <br />
      <Link href="/swap">← Back to Swap</Link>
    </main>
  );
}
