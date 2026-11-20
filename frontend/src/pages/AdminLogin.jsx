import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address');
    if (!form.password) return setError('Password is required');
    setLoading(true); setError('');
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit} noValidate>
        <div className="welcome__icon"><Coffee size={30} /></div>
        <h1>Admin sign in</h1>
        <p className="muted">Brew &amp; Bites management panel</p>
        <label className="field"><span>Email</span>
          <div className="input-icon"><Mail size={17} />
            <input type="email" autoComplete="username" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(''); }} />
          </div>
        </label>
        <label className="field"><span>Password</span>
          <div className="input-icon"><Lock size={17} />
            <input type="password" autoComplete="current-password" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }} />
          </div>
        </label>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
