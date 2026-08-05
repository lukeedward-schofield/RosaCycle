import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Camera, Star, X } from 'lucide-react';
import Header from '@/shared/components/layout/Header';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import PasswordInput from '@/shared/components/common/PasswordInput';
import { useAuth } from '@/features/auth/AuthContext';

const inputClass =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none';
const labelClass = 'text-sm font-medium text-gray-700 mb-1 block';

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const email = user?.email || '';
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 'idle' | 'cooldown-warning' | 'confirm-password'
  const [step, setStep] = useState('idle');
  const [warningType, setWarningType] = useState(null); // 'info' | 'password'
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const changingPassword = currentPassword.length > 0 || password.length > 0 || confirmPassword.length > 0;

  const infoChanged =
    firstName.trim() !== (user?.firstName || '') ||
    lastName.trim() !== (user?.lastName || '') ||
    username.trim() !== (user?.username || '');

  const imageChanged = imageFile !== null;
  const hasChanges = infoChanged || imageChanged || changingPassword;

  const infoValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 2;

  const passwordValid =
    !changingPassword ||
    (currentPassword.length > 0 && password.length >= 6 && password === confirmPassword);

  const canSave = hasChanges && infoValid && passwordValid;

  const initial = firstName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?';

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildUpdates = () => {
    const updates = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
    };
    if (changingPassword) updates.password = password;
    if (imageFile) updates.imageFile = imageFile;
    return updates;
  };

  const submit = async (currentPasswordForRequest) => {
    setSaving(true);
    setError('');
    try {
      await updateUser(buildUpdates(), currentPasswordForRequest || undefined);
      navigate(-1);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('idle');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!canSave || saving) return;

    if (changingPassword) {
      setWarningType('password');
      setStep('cooldown-warning');
      return;
    }

    if (infoChanged) {
      setWarningType('info');
      setStep('cooldown-warning');
      return;
    }

    // Image-only change: no cooldown, no password prompt.
    await submit();
  };

  const handleConfirmCooldown = async () => {
    if (warningType === 'password') {
      // Current password was already entered inline — proceed straight to save.
      setStep('idle');
      await submit(currentPassword);
      return;
    }
    setStep('confirm-password');
  };

  const handleConfirmPassword = async () => {
    if (!confirmPasswordInput) {
      setConfirmError('Please enter your current password.');
      return;
    }
    setConfirmError('');
    await submit(confirmPasswordInput);
    setConfirmPasswordInput('');
  };

  const closeModal = () => {
    setStep('idle');
    setWarningType(null);
    setConfirmPasswordInput('');
    setConfirmError('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Edit Profile" />

      <div className="p-5 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 py-2">
          <button
            onClick={handlePickImage}
            className="relative w-24 h-24 rounded-full active:scale-95 transition-transform"
            aria-label="Change profile photo"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-600 text-white text-3xl font-semibold flex items-center justify-center">
                {initial}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center border-2 border-white">
              <Camera size={15} />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {typeof user?.rating === 'number' && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Star size={15} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{user.rating.toFixed(1)}</span>
              <span className="text-gray-400">rating</span>
            </div>
          )}
        </div>

        <fieldset className="space-y-4">
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
            <div className="w-full px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-500">
              {email}
            </div>
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

        <PrimaryButton onClick={handleSave} disabled={!canSave || saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </PrimaryButton>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 text-white font-semibold active:scale-[0.98] transition-transform hover:bg-red-600"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      {step === 'cooldown-warning' && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Heads up</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {warningType === 'password'
                ? "Once you save, you won't be able to change your password again for 7 days. Do you want to continue?"
                : "Once you save these changes, you won't be able to update your profile info again for 7 days. Do you want to continue?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCooldown}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'confirm-password' && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Confirm it&apos;s you</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div>
              <label className={labelClass}>Current password</label>
              <PasswordInput
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Enter your current password"
              />
              {confirmError && <p className="text-xs text-red-500 mt-1">{confirmError}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleConfirmPassword}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}