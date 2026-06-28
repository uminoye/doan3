import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md px-4">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
              Hệ thống Xuất Nhập Tồn
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
              Đăng nhập để tiếp tục
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--surface-2)' }}>
            <p className="text-xs font-semibold mb-2">Tài khoản demo (mật khẩu: 123456):</p>
            <div className="space-y-1 text-xs" style={{ color: 'var(--muted)' }}>
              <p>admin@company.com — Admin</p>
              <p>sales1@company.com — Sales</p>
              <p>logistics@company.com — Logistics</p>
              <p>warehouse@company.com — Kho</p>
              <p>factory@company.com — Nhà máy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
