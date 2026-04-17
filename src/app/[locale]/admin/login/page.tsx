'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAdminAuth } from '@/lib/firebase/auth';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { user, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin/reports');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let the useEffect handle the redirect
    } catch (err: any) {
      setError('Invalid email or password.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  // If already logged in, the useEffect will redirect
  if (user) return null;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage restaurant reports
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-red-900/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
