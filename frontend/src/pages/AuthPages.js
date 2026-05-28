import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(230,57,70,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(52,152,219,0.06) 0%, transparent 50%)',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Film size={24} color="white" />
            </div>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.1em' }}>
              CINE<span style={{ color: 'var(--accent)' }}>STREAM</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '32px 28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>{title}</h1>
          <p style={{ color: 'var(--text3)', textAlign: 'center', fontSize: 14, marginBottom: 28 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, showToggle, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={16} color="var(--text3)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field"
        style={{ paddingLeft: 38, paddingRight: showToggle ? 40 : 14 }}
      />
      {showToggle && (
        <button onClick={onToggle} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text3)',
        }}>
          {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user?.role === 'admin' || user?.is_staff ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue streaming">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div style={{
            background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 13,
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <InputField icon={Mail} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
        <InputField icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} showToggle onToggle={() => setShowPw(!showPw)} />

        <button type="submit" disabled={loading} className="btn btn-primary" style={{
          width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 6,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 14, marginTop: 20 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.password2);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.email?.[0] || data?.username?.[0] || data?.password?.[0] || data?.detail || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start streaming thousands of movies">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div style={{
            background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 13,
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <InputField icon={User} placeholder="Username" value={form.username} onChange={set('username')} />
        <InputField icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={set('email')} />
        <InputField icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password (min 8 chars)" value={form.password} onChange={set('password')} showToggle onToggle={() => setShowPw(!showPw)} />
        <InputField icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Confirm password" value={form.password2} onChange={set('password2')} />

        <button type="submit" disabled={loading} className="btn btn-primary" style={{
          width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 6,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 14, marginTop: 20 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
