import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { accountAPI } from '../services/api'
import Layout from '../components/Layout'
import { Card, Badge, Button, Spinner } from '../components/UI'
import '../components/components.css'

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function AccountBalanceCard({ account, token }) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    accountAPI.getBalance(account._id, token)
      .then(d => setBalance(d.balance))
      .catch(() => setBalance(0))
      .finally(() => setLoading(false))
  }, [account._id, token])

  const shortId = account._id.slice(-8).toUpperCase()

  return (
    <Card glow>
      <div className="stat-card">
        <div className="account-card-id">
          <span style={{ color: 'var(--accent-light)' }}>ACC</span>
          <span>···{shortId}</span>
          <Badge status={account.status} />
        </div>
        {loading
          ? <div className="account-balance-loading" />
          : <div className="account-balance">{formatINR(balance ?? 0)}</div>
        }
        <div className="stat-sub">
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {account.currency} · Created {new Date(account.createdAt).toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    accountAPI.getAll(token)
      .then(d => setAccounts(d.accounts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <p className="page-subtitle" style={{ marginBottom: 4 }}>
            {greeting}, <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
          </p>
          <h1 className="page-title">Financial Overview</h1>
          <p className="page-subtitle">Your accounts at a glance</p>
        </div>

        {/* Summary Stats */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          <Card>
            <div className="stat-card">
              <div className="stat-label">Total Accounts</div>
              <div className="stat-value">{accounts.length}</div>
              <div className="stat-sub">{activeAccounts.length} active</div>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <div className="stat-label">Account Email</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', marginTop: 6, wordBreak: 'break-all' }}>
                {user?.email}
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <div className="stat-label">Member Since</div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </Card>
        </div>

        {/* Accounts */}
        <div className="section-header">
          <h2 className="section-title">Your Accounts</h2>
          <Button size="sm" variant="secondary" onClick={() => navigate('/accounts')}>
            Manage →
          </Button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner size="lg" />
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <div className="empty">
              <div className="empty-icon">⬡</div>
              <p className="empty-text">No accounts yet.</p>
              <Button
                style={{ marginTop: 16 }}
                onClick={() => navigate('/accounts')}
              >
                Create your first account
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid-auto">
            {accounts.map(acc => (
              <AccountBalanceCard key={acc._id} account={acc} token={token} />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ marginTop: 32 }}>
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="grid-3">
            <Card className="card--clickable" onClick={() => navigate('/accounts')}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>⬡</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4 }}>New Account</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Open a new bank account</div>
            </Card>
            <Card className="card--clickable" onClick={() => navigate('/transfer')}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>⇄</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4 }}>Transfer Funds</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Send money between accounts</div>
            </Card>
            <Card className="card--clickable" onClick={() => navigate('/system')}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>⚙</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4 }}>System Admin</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Seed initial funds</div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
