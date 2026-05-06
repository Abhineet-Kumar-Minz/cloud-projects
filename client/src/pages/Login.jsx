import { useState } from 'react';
import { Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Orbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="orb bg-primary/40 w-[500px] h-[500px] -top-32 -left-32 animate-float-slow" />
    <div className="orb bg-accent/40 w-[600px] h-[600px] top-1/3 -right-40 animate-float-slower" />
    <div className="orb bg-primary/30 w-[400px] h-[400px] bottom-0 left-1/3 animate-float-slow" style={{ animationDelay: '4s' }} />
  </div>
);

export default function Login() {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'signup') {
        await API.post('/auth/register', form);
        setMode('signin');
      } else {
        const { data } = await API.post('/auth/login', form);
        login(data.token, data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4">
      <Orbs />
      <div className="w-full max-w-md animate-scale-in">
        <div className="glass-strong rounded-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 btn-gradient rounded-2xl blur-xl opacity-60" />
              <div className="relative btn-gradient h-14 w-14 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to <span className="gradient-text">TaskFlow</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {mode === 'signin' ? 'Sign in to manage your tasks' : 'Create an account to get started'}
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password" required minLength={6}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full h-11 rounded-xl btn-gradient text-white font-semibold flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary hover:underline font-medium">
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}