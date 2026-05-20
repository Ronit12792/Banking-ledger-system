import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { Input, Button, Alert } from '../components/UI'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faEnvelope,
  faLock,
  faRightToBracket,
  faBuildingColumns
} from '@fortawesome/free-solid-svg-icons'

import '../components/components.css'

export default function Login() {

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')

  const { login, loading } = useAuth()

  const navigate = useNavigate()

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (!form.email || !form.password) {
      return setError('All fields are required.')
    }

    const res = await login(form.email, form.password)

    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.message)
    }
  }

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-left">

        <div className="auth-left-bg" />

        {/* BRAND */}
        <div className="auth-brand">

          <div className="auth-brand-icon">
            <FontAwesomeIcon icon={faBuildingColumns} />
          </div>

          <div className="auth-brand-name">
            Banking Ledger
          </div>

        </div>

        {/* TAGLINE */}
        <div className="auth-tagline">

          <h1>
            Double-entry
            <br />
            <span>accounting</span>
            <br />
            built for scale.
          </h1>

          <p>
            Every transaction is precise, immutable,
            and auditable. Your finances engineered
            with integrity.
          </p>

        </div>

        {/* FEATURES */}
        <div className="auth-features">

          {[
            'Idempotent transactions — zero duplicates',
            'Immutable ledger entries — full audit trail',
            'Real-time balance computation',
            'Instant email notifications'
          ].map((feature) => (

            <div
              key={feature}
              className="auth-feature"
            >

              <div className="auth-feature-dot" />

              {feature}

            </div>

          ))}

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">

        <div className="auth-form-box animate-fade">

          <h2 className="auth-form-title">
            Welcome back
          </h2>

          <p className="auth-form-sub">
            Sign in to your account to continue
          </p>

          <Alert
            type="error"
            message={error}
          />

          {/* FORM */}
          <form
            className="form"
            onSubmit={handleSubmit}
            style={{
              marginTop: error ? 16 : 0
            }}
          >

            {/* EMAIL */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              icon={
                <FontAwesomeIcon icon={faEnvelope} />
              }
            />

            {/* PASSWORD */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              icon={
                <FontAwesomeIcon icon={faLock} />
              }
            />

            {/* BUTTON */}
            <Button
              type="submit"
              size="lg"
              className="btn--full"
              loading={loading}
            >

              <FontAwesomeIcon
                icon={faRightToBracket}
                style={{ marginRight: '8px' }}
              />

              Sign In

            </Button>

          </form>

          {/* REGISTER LINK */}
          <div className="auth-switch">

            Don&apos;t have an account?{' '}

            <a onClick={() => navigate('/register')}>
              Create one
            </a>

          </div>

        </div>
      </div>
    </div>
  )
}