// components/AddLiquidityForm.tsx
import { useState } from 'react'
import { useDexSettings } from '../context/DexSettingsContext'
import { approveToken } from '../lib/approve'
import { addLiquidity, ensurePoolInitialized } from '../lib/addLiquidity'
import { ethers } from 'ethers'
import ERC20ABI from '../lib/abis/ERC20.json'
import { getTickFromPrice, nearestUsableTick } from '../lib/tickMath'
import { getAddress } from '../lib/addresses'

const POSITION_MANAGER_ADDRESS = getAddress('NEXT_PUBLIC_POSITION_MANAGER_ADDRESS')
import { useWallet } from '../context/WalletContext'

export default function AddLiquidityForm() {
  const { provider } = useWallet()
  const [token0, setToken0] = useState('');
  const [token1, setToken1] = useState('');
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [priceMin, setPriceMin] = useState('0.95');
  const [priceMax, setPriceMax] = useState('1.05');
  const [status, setStatus] = useState('');

  const { poolFee, setPoolFee, slippage, setSlippage } = useDexSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!provider) {
        setStatus('Wallet not connected');
        return;
      }
     // 入力バリデーション（BigNumberishエラー対策）
      if (!amount0 || isNaN(Number(amount0)) || Number(amount0) <= 0) {
        throw new Error("Amount Token0 must be a valid number greater than 0");
      }
      if (!amount1 || isNaN(Number(amount1)) || Number(amount1) <= 0) {
        throw new Error("Amount Token1 must be a valid number greater than 0");
      }

      setStatus('Approving token0...');
      await approveToken(provider, token0, POSITION_MANAGER_ADDRESS, amount0);

      setStatus('Approving token1...');
      await approveToken(provider, token1, POSITION_MANAGER_ADDRESS, amount1);

      const signer = await provider.getSigner();
      const erc20Token0 = new ethers.Contract(token0, ERC20ABI, signer);
      const erc20Token1 = new ethers.Contract(token1, ERC20ABI, signer);

      const decimals0 = await erc20Token0.decimals();
      const decimals1 = await erc20Token1.decimals();

      const rawTickLower = getTickFromPrice(parseFloat(priceMin))
      const rawTickUpper = getTickFromPrice(parseFloat(priceMax))
      const tickLower = nearestUsableTick(rawTickLower, poolFee)
      const tickUpper = nearestUsableTick(rawTickUpper, poolFee)
      const midPrice = (parseFloat(priceMin) + parseFloat(priceMax)) / 2;

      if (tickLower >= tickUpper) {
        throw new Error('Invalid price range: Min price must be less than Max price');
      }

      setStatus(`tickLower=${tickLower}, tickUpper=${tickUpper}`);
      setStatus('Initializing pool if needed...');
      await ensurePoolInitialized(signer, token0, token1, poolFee, midPrice);

      const parsedAmount0 = ethers.parseUnits(amount0, decimals0).toString();
      const parsedAmount1 = ethers.parseUnits(amount1, decimals1).toString();

      console.log("parsedAmount0:", parsedAmount0);
      console.log("parsedAmount1:", parsedAmount1);
      console.log("tickLower:", tickLower, "tickUpper:", tickUpper);

      const tx = await addLiquidity(
        signer,
        token0,
        token1,
        poolFee,
        tickLower,
        tickUpper,
        parsedAmount0,
        parsedAmount1,
        slippage
      );

      setStatus('Transaction pending, waiting for confirmation...');
      try {
        await tx.wait();
        setStatus('✅ Success!');
      } catch (waitErr: any) {
        console.error(waitErr);
        const waitMsg = waitErr?.shortMessage || waitErr?.message || String(waitErr);
        setStatus('❌ Error while waiting for confirmation: ' + waitMsg);
        return;
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.shortMessage || err?.message || String(err);
      setStatus('❌ Error: ' + errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Liquidity</h2>

      <input type="text" placeholder="Token0 address" value={token0} onChange={e => setToken0(e.target.value)} required />
      <input type="text" placeholder="Token1 address" value={token1} onChange={e => setToken1(e.target.value)} required />

      <input type="text" placeholder="Amount Token0" value={amount0} onChange={e => setAmount0(e.target.value)} required />
      <input type="text" placeholder="Amount Token1" value={amount1} onChange={e => setAmount1(e.target.value)} required />

      <input type="text" placeholder="Min price (ex: 0.95)" value={priceMin} onChange={e => setPriceMin(e.target.value)} required />
      <input type="text" placeholder="Max price (ex: 1.05)" value={priceMax} onChange={e => setPriceMax(e.target.value)} required />
      
      <input
        type="number"
        placeholder="Pool fee"
        value={poolFee}
        onChange={e => setPoolFee(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Slippage (%)"
        step="0.1"
        value={slippage}
        onChange={e => setSlippage(Number(e.target.value))}
      />

      <button type="submit">Add Liquidity</button>

      <p>{status}</p>
    </form>
  );
}
