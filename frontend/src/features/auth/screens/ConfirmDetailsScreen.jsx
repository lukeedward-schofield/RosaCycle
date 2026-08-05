import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import { useAuth } from '@/features/auth/AuthContext';

const inputClass =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none';
const labelClass = 'text-sm font-medium text-gray-700 mb-1 block';

export default function ConfirmDetailsScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState('');

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 2;

  const initial = firstName?.[0]?.toUpperCase() || '?';

  const handleConfirm = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError('');
    try {
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
      });
      setSaving(false);
      setTransitioning(true);
      setTimeout(() => {
        navigate('/trades', { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  if (transitioning) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 mt-4">Setting things up...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 text-center">Confirm your details</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-8">
        We pulled this from your Google account. Feel free to adjust it.
      </p>

      <div className="flex justify-center mb-8">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand-600 text-white text-3xl font-semibold flex items-center justify-center">
            {initial}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First name</label>
            <input
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input
              className={inputClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Username</label>
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <PrimaryButton onClick={handleConfirm} disabled={!canSubmit || saving}>
          {saving ? 'Saving...' : 'Confirm & Continue'}
        </PrimaryButton>
      </div>
    </div>
  );
}