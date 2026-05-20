import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { accountAPI } from '../services/api'
import Layout from '../components/Layout'
import { Card, Badge, Button, Alert, Modal, CopyButton, Spinner } from '../components/UI'
import '../components/components.css'

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function AccountCard({ account, token, onRefresh }) {
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [showId, setShowId] = useState(false)

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true)
    try {
      const d = await accountAPI.getBalance(account._id, token)
      setBalance(d.balance)
    } catch {
      setBalance(0)
    } finally {
      setBalanceLoading(false)
    }
  }, [account._id, token])

  useEffect(() => { loadBalance() }, [loadBalance])

  return (
    <Card glow>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Badge status={account.status} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{account.currency}</span>
      </div>

      {balanceLoading
        ? <div className="account-balance-loading" />
        : <div className="account-balance">{formatINR(balance ?? 0)}</div>
      }

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Current balance
      </div>

      <div className="divider" />

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Account ID</span>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}
            onClick={() => setShowId(v => !v)}
          >
            {showId ? 'hide' : 'show'}
          </button>
        </div>
        {showId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', borderRadius: 6, padding: '8px 10px' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, wordBreak: 'break-all' }}>
              {account._id}
            </span>
            <CopyButton text={account._id} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Created</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {new Date(account.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant="secondary"
        className="btn--full"
        style={{ marginTop: 16 }}
        onClick={loadBalance}
      >
        ↻ Refresh Balance
      </Button>
    </Card>
  )
}

export default function Accounts() {
  const { token } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const d = await accountAPI.getAll(token)
      setAccounts(d.accounts || [])
    } catch { } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  const handleCreate = async () => {
    setCreating(true)
    setError(''); setSuccess('')
    try {
      await accountAPI.create(token)
      setSuccess('Account created successfully!')
      setConfirmOpen(false)
      loadAccounts()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Accounts</h1>
            <p className="page-subtitle">Manage your bank accounts</p>
          </div>
          <Button onClick={() => setConfirmOpen(true)}>
            + New Account
          </Button>
        </div>

        {(error || success) && (
          <div style={{ marginBottom: 20 }}>
            <Alert type={error ? 'error' : 'success'} message={error || success} />
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Spinner size="lg" />
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <div className="empty">
              <div className="empty-icon">⬡</div>
              <p className="empty-text">No accounts found. Create your first account to get started.</p>
              <Button style={{ marginTop: 20 }} onClick={() => setConfirmOpen(true)}>
                Create Account
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {accounts.length} account{accounts.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="grid-auto">
              {accounts.map(acc => (
                <AccountCard key={acc._id} account={acc} token={token} />
              ))}
            </div>
          </>
        )}

        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Create New Account">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A new bank account will be created with <strong style={{ color: 'var(--text-primary)' }}>INR</strong> currency
              and set to <Badge status="ACTIVE" /> status by default.
            </p>
            <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>ACCOUNT DETAILS</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Currency</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>INR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Starting Balance</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>₹0.00</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" className="btn--full" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button className="btn--full" loading={creating} onClick={handleCreate}>
                Confirm & Create
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
