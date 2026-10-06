import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { ShieldCheck, Lock, User, ArrowLeft, KeyRound } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, settings, navigateTo } = useCms();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);
      if (!success) {
        setError('Invalid username or password. Please check credentials.');
      }
    }, 400);
  };

  return (
    <div className="min-h-[85vh] bg-slate-900 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Masthead */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            {settings.site_name} CMS
          </h1>
          <p className="text-xs text-slate-400">
            Administrative Access &amp; Editorial Management Desk
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
          </button>
        </form>

        {/* Return to website */}
        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Homepage</span>
          </a>
        </div>
      </div>
    </div>
  );
};
