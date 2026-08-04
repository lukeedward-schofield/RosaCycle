import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '@/shared/components/common/Logo';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import PasswordInput from '@/shared/components/common/PasswordInput';
import { loginUser, loginWithGoogle } from '@/shared/services/api';
import { useAuth } from '@/features/auth/AuthContext';

export default function SignInScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    try {
      const { user, token } = await loginUser({ email: email.trim(), password });
      login(user, token);
      navigate('/trades', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { user, token } = await loginWithGoogle(credentialResponse.credential);
      login(user, token);
      navigate('/trades', { replace: true });
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10">
      <div className="flex justify-center mb-8">
        <Logo size="lg" iconOnly />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center">Welcome back</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-8">Sign in to continue.</p>

      {/* Google Login Section */}
      <div className="flex flex-col items-center mb-6">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Sign-In was unsuccessful.')}
          useOneTap
        />
        
        <div className="flex items-center w-full mt-6 mb-2">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-sm text-gray-400">or continue with email</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <PrimaryButton type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </PrimaryButton>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-brand-600 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
}