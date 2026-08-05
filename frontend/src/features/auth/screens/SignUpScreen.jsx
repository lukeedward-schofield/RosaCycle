import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '@/shared/components/common/Logo';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import PasswordInput from '@/shared/components/common/PasswordInput';
import { registerUser, loginWithGoogle } from '@/shared/services/api';
import { useAuth } from '@/features/auth/AuthContext';

const inputClass =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none';
const labelClass = 'text-sm font-medium text-gray-700 mb-1 block';

export default function SignUpScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validationMessage = (() => {
    if (!firstName.trim() || !lastName.trim()) return 'Enter your first and last name.';
    if (username.trim().length <= 2) return 'Username must be at least 3 characters.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return "Passwords don't match.";
    return '';
  })();
  const canSubmit = validationMessage === '';
  const touched = [firstName, lastName, username, email, password, confirmPassword].some(
    (v) => v.length > 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    try {
      const { user, token } = await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });
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
      const { user, token, isNewUser } = await loginWithGoogle(credentialResponse.credential);
      login(user, token);
      navigate(isNewUser ? '/confirm-details' : '/trades', { replace: true });
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

      <h1 className="text-2xl font-bold text-gray-900 text-center">Create your account</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-8">
        Join RosaCycle and start trading recyclables.
      </p>

      {/* Google Sign Up Section */}
      <div className="flex flex-col items-center mb-6">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Sign-Up was unsuccessful.')}
          useOneTap
        />
        
        <div className="flex items-center w-full mt-6 mb-2">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-sm text-gray-400">or sign up with email</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First name</label>
            <input
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Juan"
            />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input
              className={inputClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Dela Cruz"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Username</label>
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="juandelacruz"
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className={labelClass}>Confirm password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
          />
        </div>

        {touched && validationMessage && (
          <p className="text-xs text-gray-500">{validationMessage}</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <PrimaryButton type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </PrimaryButton>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/signin" className="text-brand-600 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}