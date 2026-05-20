import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { accountAPI, transactionAPI } from '../services/api'
import Layout from '../components/Layout'
import { Card, Button, Alert, Badge } from '../components/UI'
import '../components/components.css'

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function generateKey() {
  return `init-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 50000, 100000]

export default function System() {
  const { token, user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({ toAccount: '', amount: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [idempotencyKey] = useState(generateKey())

  useEffect(() => {
    accountAPI.getAll(token)
      .then(d => setAccounts(d.accounts || []))
      .catch(() => {})
  }, [token])

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setError(''); setSuccess('')
  }

  const handlePreset = (val) => {
    setForm(f => ({ ...f, amount: String(val) }))
    setError(''); setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.toAccount) return setError('Select a destination account.')
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return setError('Enter a valid amount.')

    setSubmitting(true)
    setError(''); setSuccess('')
    try {
      await transactionAPI.initialFunds({
        toAccount: form.toAccount,
        amount,
        idempotencyKey: generateKey(),
      }, token)
      setSuccess(`Successfully seeded ${formatINR(amount)} into account ···${form.toAccount.slice(-8).toUpperCase()}`)
      setForm({ toAccount: '', amount: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h1 className="page-title">System Admin</h1>
            <span style={{
              background: 'var(--yellow-bg)',
              color: 'var(--yellow)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 6,
              padding: '2px 10px',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>System User Only</span>
          </div>
          <p className="page-subtitle">Seed initial funds into accounts — requires system user privileges</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <Card>
            <div className="section-title" style={{ marginBottom: 20 }}>Seed Initial Funds</div>

            {(error || success) && (
              <div style={{ marginBottom: 20 }}>
                <Alert type={error ? 'error' : 'success'} message={error || success} />
              </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
              {/* To Account */}
              <div className="input-group">
                <label className="input-label">Destination Account</label>
                <select className="select" value={form.toAccount} onChange={set('toAccount')}>
                  <option value="">— Select account —</option>
                  {accounts.map(a => (
                    <option key={a._id} value={a._id}>
                      ···{a._id.slice(-8).toUpperCase()} · {a.status} · {a.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preset amounts */}
              <div className="input-group">
                <label className="input-label">Quick Amounts</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PRESET_AMOUNTS.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handlePreset(v)}
                      style={{
                        background: form.amount === String(v) ? 'var(--accent)' : 'var(--bg-input)',
                        color: form.amount === String(v) ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${form.amount === String(v) ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 6,
                        padding: '6px 14px',
                        fontSize: 13,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {formatINR(v)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div className="input-group">
                <label className="input-label">Custom Amount (INR)</label>
                <div className="input-wrap">
                  <span className="input-icon" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹</span>
                  <input
                    className="input input--icon"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter custom amount"
                    value={form.amount}
                    onChange={set('amount')}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="btn--full" loading={submitting}>
                ⚡ Seed Funds
              </Button>
            </form>
          </Card>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div className="section-title" style={{ marginBottom: 12 }}>Logged in as</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, background: 'var(--accent)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: 15,
                }}>
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="section-title" style={{ marginBottom: 12 }}>About This Page</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <p style={{ marginBottom: 10 }}>
                  This endpoint (<code className="mono" style={{ fontSize: 11, background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 4 }}>POST /api/transactions/system/initial-funds</code>) requires a <strong style={{ color: 'var(--yellow)' }}>system user</strong> JWT.
                </p>
                <p>
                  If you receive a 403 Forbidden error, your account does not have system user privileges.
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>
                ⚠ Funds seeded here create DEBIT + CREDIT ledger entries atomically.<br />
                🔑 Each request uses a unique idempotency key.<br />
                📊 Balance updates reflect immediately.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
