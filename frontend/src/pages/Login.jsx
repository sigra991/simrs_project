import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'ADMIN' || result.user.role === 'RESEPSIONIS') {
        navigate('/');
      } else if (result.user.role === 'DOKTER') {
        navigate('/doctor');
      } else if (result.user.role === 'APOTEKER') {
        navigate('/inventory');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="mb-8 px-4 flex flex-col items-center gap-2">
          <h1 className="font-h1 text-h1 text-primary-container tracking-tighter italic glow-text">MediFlow</h1>
          <span className="font-label-caps text-label-caps text-on-surface-variant">Sistem Informasi Manajemen RS</span>
        </div>

        <div className="glass-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error-container/20 border border-error-container text-error px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-on-surface">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm placeholder-outline-variant focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-container-high text-on-surface"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm placeholder-outline-variant focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-container-high text-on-surface"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-on-primary-container bg-primary-container hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary glow-button transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-outline font-data-mono">
                Admin: admin / admin123<br/>
                Resepsionis: resepsionis1 / resepsionis123<br/>
                Dokter: dr.sarah / dokter123<br/>
                Apoteker: apoteker1 / apoteker123
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
