'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input
          type="email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="w-full border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button disabled={loading} className="w-full rounded bg-blue-600 text-white py-2 disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-sm text-center">
          Don’t have an account? <Link className="text-blue-600" href="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}