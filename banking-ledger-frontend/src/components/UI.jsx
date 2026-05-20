import { useState } from 'react'

/* ── Button ── */
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  const base = `btn btn--${variant} btn--${size} ${className}`
  return (
    <button className={base} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}

/* ── Spinner ── */
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 16 : size === 'lg' ? 40 : 24
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* ── Input ── */
export function Input({ label, error, icon, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrap">
        {icon && <span className="input-icon">{icon}</span>}
        <input className={`input ${icon ? 'input--icon' : ''} ${error ? 'input--error' : ''}`} {...props} />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  )
}

/* ── Card ── */
export function Card({ children, className = '', onClick, glow }) {
  return (
    <div
      className={`card ${glow ? 'card--glow' : ''} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/* ── Badge ── */
export function Badge({ status }) {
  const map = {
    ACTIVE: 'badge--green',
    COMPLETED: 'badge--green',
    FROZEN: 'badge--yellow',
    PENDING: 'badge--yellow',
    CLOSED: 'badge--red',
    FAILED: 'badge--red',
    REVERSED: 'badge--red',
  }
  return <span className={`badge ${map[status] || 'badge--default'}`}>{status}</span>
}

/* ── Alert ── */
export function Alert({ type = 'error', message }) {
  if (!message) return null
  return (
    <div className={`alert alert--${type}`}>
      <span>{type === 'error' ? '✕' : '✓'}</span>
      <p>{message}</p>
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ── Copy button ── */
export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className="copy-btn" onClick={copy} title="Copy to clipboard">
      {copied ? '✓' : '⧉'}
    </button>
  )
}
