import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Header from '../components/layout/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import PasswordInput from '../components/common/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { PROFILE_EDIT_COOLDOWN_DAYS } from '../services/api';

const inputClass =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none';
const labelClass = 'text-sm font-medium text-gray-700 mb-1 block';
const COOLDOWN_MS = PROFILE_EDIT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const nextAllowedAt = user?.profileUpdatedAt
    ? new Date(user.profileUpdatedAt).getTime() + COOLDOWN_MS
    : 0;
  const onCooldown = Date.now() < nextAllowedAt;
  const nextAllowedLabel = onCooldown
    ? new Date(nextAllowedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const changingPassword = currentPassword.length > 0 || password.length > 0 || confirmPassword.length > 0;

  const hasChanges =
    firstName.trim() !== (user?.firstName || '') ||
    lastName.trim() !== (user?.lastName || '') ||
    username.trim() !== (user?.username || '') ||
    email.trim() !== (user?.email || '') ||
    changingPassword;

  const canSave =
    !onCooldown &&
    hasChanges &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    (!changingPassword ||
      (currentPassword.length > 0 && password.length >= 6 && password === confirmPassword));

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError('');
    try {
      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
      };
      if (changingPassword) updates.password = password;
      await updateUser(updates, changingPassword ? currentPassword : undefined);
      navigate(-1);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Edit Profile" />

      <div className="p-5 space-y-4">
        {onCooldown && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
            To keep accounts secure, profile changes are limited to once every{' '}
            {PROFILE_EDIT_COOLDOWN_DAYS} days. You can update your profile again on{' '}
            <span className="font-semibold">{nextAllowedLabel}</span>.
          </p>
        )}

        <fieldset disabled={onCooldown} className="space-y-4 disabled:opacity-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First name</label>
              <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Username</label>
            <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-sm font-semibold text-gray-900">Change Password</p>

            <div>
              <label className={labelClass}>Current password</label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to set a new password"
              />
            </div>

            <div>
              <label className={labelClass}>New password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className={labelClass}>Confirm new password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match.</p>
              )}
            </div>
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!onCooldown && (
          <PrimaryButton onClick={handleSave} disabled={!canSave || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </PrimaryButton>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 text-white font-semibold active:scale-[0.98] transition-transform hover:bg-red-600"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );
}
