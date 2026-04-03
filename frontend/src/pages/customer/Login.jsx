import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/customer/login', form)
            const data = response.data

            if (data.status === 'success') {
                // Store token if returned
                if (data.token) {
                    localStorage.setItem('token', data.token)
                }

                // Save user with role to context + localStorage
                const userData = {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role || 'customer',
                }
                login(userData)

                // Redirect based on role
                if (userData.role === 'admin') {
                    navigate('/admin/menu')
                } else {
                    navigate('/menu')
                }
            } else {
                setError(data.message || 'Invalid email or password')
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoWrap}>
                    <span style={styles.logoIcon}>🍔</span>
                    <h1 style={styles.brand}>FoodOrder</h1>
                </div>

                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Sign in to your account</p>

                {error && (
                    <div style={styles.errorBox}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            style={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.btn,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>
                        Create one
                    </Link>
                </p>

                <p style={styles.switchText}>
                    <Link to="/menu" style={styles.linkMuted}>
                        ← Browse menu without logging in
                    </Link>
                </p>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
        justifyContent: 'center',
    },
    logoIcon: {
        fontSize: '32px',
    },
    brand: {
        color: '#f97316',
        fontSize: '24px',
        fontWeight: '800',
        margin: 0,
    },
    title: {
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '700',
        margin: '0 0 8px 0',
        textAlign: 'center',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '32px',
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        color: '#fca5a5',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '13px',
        fontWeight: '500',
    },
    input: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#ffffff',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    btn: {
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        padding: '14px',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '8px',
        transition: 'transform 0.15s',
    },
    switchText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        marginTop: '20px',
    },
    link: {
        color: '#f97316',
        textDecoration: 'none',
        fontWeight: '600',
    },
    linkMuted: {
        color: 'rgba(255,255,255,0.4)',
        textDecoration: 'none',
        fontSize: '13px',
    },
}
