import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { Input, Button, Alert } from '../components/UI'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faUser,
  faEnvelope,
  faLock,
  faUserPlus,
  faBuildingColumns
} from '@fortawesome/free-solid-svg-icons'

import '../components/components.css'

export default function Register() {

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, loading } = useAuth()

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
    setSuccess('')

    if (!form.name || !form.email || !form.password) {
      return setError('All fields are required.')
    }

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    const res = await register(
      form.name,
      form.email,
      form.password
    )

    if (res.success) {

      setSuccess('Account created! Redirecting...')

      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)

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
            Start your
            <br />
            <span>financial</span>
            <br />
            journey today.
          </h1>

          <p>
            Create your account in seconds.
            Manage accounts, track balances,
            and transfer funds with confidence.
          </p>

        </div>

        {/* FEATURES */}
        <div className="auth-features">

          {[
            'Secure JWT authentication',
            'Multi-account management',
            'INR currency support',
            'Welcome email on signup'
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
            Create account
          </h2>

          <p className="auth-form-sub">
            Join Banking Ledger — it&apos;s free
          </p>

          {(error || success) && (

            <div style={{ marginBottom: 16 }}>

              <Alert
                type={error ? 'error' : 'success'}
                message={error || success}
              />

            </div>

          )}

          {/* FORM */}
          <form
            className="form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
              icon={
                <FontAwesomeIcon icon={faUser} />
              }
            />

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
              placeholder="Min. 6 characters"
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
                icon={faUserPlus}
                style={{ marginRight: '8px' }}
              />

              Create Account

            </Button>

          </form>

          {/* LOGIN LINK */}
          <div className="auth-switch">

            Already have an account?{' '}

            <a onClick={() => navigate('/login')}>
              Sign in
            </a>

          </div>

        </div>
      </div>
    </div>
  )
}