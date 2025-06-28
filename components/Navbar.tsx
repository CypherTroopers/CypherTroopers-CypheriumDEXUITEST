// components/Navbar.tsx
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWallet } from '../context/WalletContext'
import { useTranslation } from 'next-i18next'

const Navbar = () => {
  const router = useRouter()
  const { account, connectWallet } = useWallet()
  const { t } = useTranslation('common')
  const addrShort = (addr: string) => `${addr.slice(0,6)}...${addr.slice(-4)}`
  const isActive = (path: string) => router.pathname === path

  return (
    <nav style={{
      display: 'flex',
      gap: 20,
      padding: '10px 20px',
      backgroundColor: '#f0f0f0',
      borderBottom: '1px solid #ccc',
    }}>
      <Link href="/swap" style={{ fontWeight: isActive('/swap') ? 'bold' : 'normal' }}>{t('swap')}</Link>
      <Link href="/tokens" style={{ fontWeight: isActive('/tokens') ? 'bold' : 'normal' }}>{t('tokens')}</Link>
      <Link href="/pools" style={{ fontWeight: isActive('/pools') ? 'bold' : 'normal' }}>{t('pools')}</Link>
      <Link href="/dashboard" style={{ fontWeight: isActive('/dashboard') ? 'bold' : 'normal' }}>{t('dashboard')}</Link>
    </nav>
  )
}

export default Navbar
