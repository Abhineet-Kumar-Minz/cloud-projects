import { useState, useEffect } from 'react';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital@1&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    background: #060912;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.18;
    animation: drift 12s ease-in-out infinite alternate;
  }
  .orb1 { width: 500px; height: 500px; background: #3b82f6; top: -120px; left: -100px; animation-delay: 0s; }
  .orb2 { width: 400px; height: 400px; background: #06b6d4; bottom: -80px; right: -80px; animation-delay: -4s; }
  .orb3 { width: 300px; height: 300px; background: #6366f1; top: 40%; left: 40%; animation-delay: -8s; }

  @keyframes drift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(30px, 20px) scale(1.08); }
  }

  .grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .card {
    position: relative; z-index: 10;
    width: 420px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 48px 40px;
    backdrop-filter: blur(24px);
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(32px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .logo-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 32px;
    animation: fadeUp 0.6s 0.1s both;
  }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-text {
    font-size: 15px; font-weight: 600;
    color: rgba(255,255,255,0.7);
    letter-spacing: 0.02em;
  }

  .headline {
    font-size: 28px; font-weight: 700;
    color: #fff; line-height: 1.2;
    margin-bottom: 6px;
    animation: fadeUp 0.6s 0.15s both;
  }
  .subline {
    font-size: 14px; color: rgba(255,255,255,0.35);
    margin-bottom: 36px;
    font-family: 'Playfair Display', serif;
    font-style: italic;
    animation: fadeUp 0.6s 0.2s both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .field {
    margin-bottom: 16px;
    animation: fadeUp 0.6s both;
  }
  .field:nth-child(1) { animation-delay: 0.25s; }
  .field:nth-child(2) { animation-delay: 0.3s; }

  .field label {
    display: block;
    font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .field input {
    width: 100%; padding: 14px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #fff; font-size: 14px;
    font-family: 'Outfit', sans-serif;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .field input::placeholder { color: rgba(255,255,255,0.2); }
  .field input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.08);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }

  .error-msg {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5; font-size: 13px;
    padding: 10px 14px; border-radius: 10px;
    margin-bottom: 16px;
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  .btn {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    border: none; border-radius: 12px;
    color: #fff; font-size: 15px; font-weight: 600;
    font-family: 'Outfit', sans-serif;
    cursor: pointer; margin-top: 8px;
    position: relative; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s;
    animation: fadeUp 0.6s 0.35s both;
    box-shadow: 0 4px 24px rgba(99,102,241,0.35);
  }
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99,102,241,0.5);
  }
  .btn:active { transform: translateY(0); }
  .btn.loading { opacity: 0.7; cursor: not-allowed; }

  .btn-shimmer {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
    transform: translateX(-100%);
    animation: shimmer 2.5s infinite;
  }
  @keyframes shimmer {
    to { transform: translateX(100%); }
  }

  .register-link {
    text-align: center; margin-top: 24px;
    font-size: 13px; color: rgba(255,255,255,0.3);
    animation: fadeUp 0.6s 0.4s both;
  }
  .register-link a {
    color: #818cf8; text-decoration: none; font-weight: 600;
    transition: color 0.15s;
  }
  .register-link a:hover { color: #a5b4fc; }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0;
    animation: fadeUp 0.6s 0.38s both;
  }
  .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .divider-text { font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: 0.08em; }

  .dots {
    position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  }
  .dot {
    position: absolute; width: 2px; height: 2px;
    background: rgba(255,255,255,0.4); border-radius: 50%;
    animation: twinkle 3s infinite;
  }
  @keyframes twinkle {
    0%,100% { opacity: 0; } 50% { opacity: 1; }
  }
`;

const dots = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 3}s`,
  duration: `${2 + Math.random() * 3}s`,
}));

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="grid-bg" />
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="dots">
          {dots.map(d => (
            <div key={d.id} className="dot" style={{
              top: d.top, left: d.left,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }} />
          ))}
        </div>

        <div className="card">
          <div className="logo-row">
            <div className="logo-icon">✦</div>
            <span className="logo-text">TaskFlow</span>
          </div>

          <h1 className="headline">Welcome back</h1>
          <p className="subline">sign in to your workspace</p>

          {error && <div className="error-msg">⚠ {error}</div>}

          <div className="field">
            <label>Email</label>
            <input
              type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button className={`btn ${loading ? 'loading' : ''}`} onClick={handleSubmit} disabled={loading}>
            <div className="btn-shimmer" />
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">NEW HERE?</span>
            <div className="divider-line" />
          </div>

          <div className="register-link">
            Don't have an account? <a href="/register">Create one free</a>
          </div>
        </div>
      </div>
    </>
  );
}