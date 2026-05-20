import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { accountAPI, transactionAPI } from '../services/api'
import Layout from '../components/Layout'
import { Card, Button, Alert, Badge, Spinner } from '../components/UI'
import '../components/components.css'

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function generateIdempotencyKey() {
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function Transfer() {
  const { token } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [balances, setBalances] = useState({})
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', amount: '' })
  const [idempotencyKey] = useState(generateIdempotencyKey())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    accountAPI.getAll(token)
      .then(async d => {
        const accs = (d.accounts || []).filter(a => a.status === 'ACTIVE')
        setAccounts(accs)
        // load balances
        const bals = {}
        await Promise.all(accs.map(async a => {
          try {
            const b = await accountAPI.getBalance(a._id, token)
            bals[a._id] = b.balance
          } catch { bals[a._id] = 0 }
        }))
        setBalances(bals)
      })
      .catch(() => {})
      .finally(() => setLoadingAccounts(false))
  }, [token])

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setError(''); setSuccess('')
  }

  const fromAccount = accounts.find(a => a._id === form.fromAccount)
  const fromBalance = fromAccount ? (balances[fromAccount._id] ?? 0) : null
  const amount = parseFloat(form.amount) || 0

  const validate = () => {
    if (!form.fromAccount) return 'Please select a source account.'
    if (!form.toAccount) return 'Please select a destination account.'
    if (form.fromAccount === form.toAccount) return 'Source and destination must be different.'
    if (!form.amount || amount <= 0) return 'Enter a valid amount.'
    if (fromBalance !== null && amount > fromBalance) return `Insufficient balance. Available: ${formatINR(fromBalance)}`
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)

    setSubmitting(true)
    setError(''); setSuccess('')
    try {
      await transactionAPI.create({
        fromAccount: form.fromAccount,
        toAccount: form.toAccount,
        amount: Number(form.amount),
        idempotencyKey,
      }, token)
      setSuccess(`Transaction of ${formatINR(amount)} completed successfully! A confirmation email has been sent.`)
      setForm({ fromAccount: '', toAccount: '', amount: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingAccounts) {
    return (
      <Layout>
        <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Transfer Funds</h1>
          <p className="page-subtitle">Move money between accounts securely</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <Card>
            {(error || success) && (
              <div style={{ marginBottom: 20 }}>
                <Alert type={error ? 'error' : 'success'} message={error || success} />
              </div>
            )}

            {accounts.length < 2 ? (
              <div className="empty">
                <div className="empty-icon">⇄</div>
                <p className="empty-text">You need at least 2 active accounts to make a transfer.</p>
              </div>
            ) : (
              <form className="form" onSubmit={handleSubmit}>
                {/* From Account */}
                <div className="input-group">
                  <label className="input-label">From Account</label>
                  <select
                    className="select"
                    value={form.fromAccount}
                    onChange={set('fromAccount')}
                  >
                    <option value="">— Select source account —</option>
                    {accounts.map(a => (
                      <option key={a._id} value={a._id}>
                        ···{a._id.slice(-8).toUpperCase()} · {formatINR(balances[a._id] ?? 0)}
                      </option>
                    ))}
                  </select>
                  {fromAccount && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                      Balance: <span style={{ color: fromBalance < amount && amount > 0 ? 'var(--red)' : 'var(--green)' }}>
                        {formatINR(fromBalance)}
                      </span>
                    </div>
                  )}
                </div>

                {/* To Account */}
                <div className="input-group">
                  <label className="input-label">To Account</label>
                  <select
                    className="select"
                    value={form.toAccount}
                    onChange={set('toAccount')}
                  >
                    <option value="">— Select destination account —</option>
                    {accounts
                      .filter(a => a._id !== form.fromAccount)
                      .map(a => (
                        <option key={a._id} value={a._id}>
                          ···{a._id.slice(-8).toUpperCase()} · {formatINR(balances[a._id] ?? 0)}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="input-group">
                  <label className="input-label">Amount (INR)</label>
                  <div className="input-wrap">
                    <span className="input-icon" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹</span>
                    <input
                      className="input input--icon"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={set('amount')}
                    />
                  </div>
                </div>

                {/* Idempotency Key (readonly info) */}
                <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Idempotency Key (auto-generated)
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                    {idempotencyKey}
                  </div>
                </div>

                <Button type="submit" size="lg" className="btn--full" loading={submitting}>
                  ⇄ Send Transfer
                </Button>
              </form>
            )}
          </Card>

          {/* Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div className="section-title" style={{ marginBottom: 14 }}>Transfer Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'From', value: form.fromAccount ? `···${form.fromAccount.slice(-8).toUpperCase()}` : '—' },
                  { label: 'To', value: form.toAccount ? `···${form.toAccount.slice(-8).toUpperCase()}` : '—' },
                  { label: 'Amount', value: amount > 0 ? formatINR(amount) : '—' },
                  { label: 'Fees', value: '₹0.00' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                    <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Deducted</span>
                  <span className="mono" style={{ color: 'var(--accent-light)' }}>
                    {amount > 0 ? formatINR(amount) : '—'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="section-title" style={{ marginBottom: 12 }}>How it works</div>
              {[
                { icon: '①', text: 'Select source & destination accounts' },
                { icon: '②', text: 'Enter the transfer amount' },
                { icon: '③', text: 'Double-entry ledger records both DEBIT and CREDIT atomically' },
                { icon: '④', text: 'Email confirmation sent on success' },
              ].map(s => (
                <div key={s.icon} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </Card>

            <Card>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
                ⚡ Transactions are atomic — either fully completed or fully rolled back.<br />
                🔒 Idempotency keys prevent duplicate transactions.<br />
                📧 Email sent to registered address on success.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
