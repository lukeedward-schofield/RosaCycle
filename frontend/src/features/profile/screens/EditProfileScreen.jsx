import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Camera, Star, X } from 'lucide-react';
import Header from '@/shared/components/layout/Header';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import PasswordInput from '@/shared/components/common/PasswordInput';
import { useAuth } from '@/features/auth/AuthContext';

const inputClass =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none';
const labelClass = 'text-sm font-medium text-gray-700 mb-1 block';

function daysLeft(updatedAtIso, cooldownDays) {
  if (!updatedAtIso || !cooldownDays) return 0;
  const nextAllowed = new Date(updatedAtIso).getTime() + cooldownDays * 24 * 60 * 60 * 1000;
  const diff = nextAllowed - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const email = user?.email || '';
  const hasPassword = user?.hasPassword !== false; // default true if unknown

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');

  // 'idle' | 'cooldown-warning' | 'confirm-password'
  const [step, setStep] = useState('idle');
  const [warningType, setWarningType] = useState(null); // 'info' | 'password' | 'both'
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  const cooldownDays = user?.profileEditCooldownDays;
  const infoDaysLeft = daysLeft(user?.infoUpdatedAt, cooldownDays);
  const passwordDaysLeft = daysLeft(user?.passwordUpdatedAt, cooldownDays);

  const changingPassword = currentPassword.length > 0 || password.length > 0 || confirmPassword.length > 0;

  const firstNameChanged = firstName.trim() !== (user?.firstName || '');
  const lastNameChanged = lastName.trim() !== (user?.lastName || '');
  const usernameChanged = username.trim() !== (user?.username || '');
  const infoChanged = firstNameChanged || lastNameChanged || usernameChanged;

  const imageChanged = imageFile !== null;
  const hasChanges = infoChanged || imageChanged || changingPassword;

  const infoValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 2;

  const passwordValid =
    !changingPassword ||
    ((!hasPassword || currentPassword.length > 0) && password.length >= 6 && password === confirmPassword);

  const canSave = hasChanges && infoValid && passwordValid;

  const initial = firstName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?';

  // Clean up any object URL we created, on unmount.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handlePickImage = () => {
    if (saving) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageFile(file);
    setImagePreview(url);
  };

  const handleRemovePhoto = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageFile(null);
    setImagePreview(user?.profileImage || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildUpdates = () => {
    const updates = {};
    if (firstNameChanged) updates.firstName = firstName.trim();
    if (lastNameChanged) updates.lastName = lastName.trim();
    if (usernameChanged) updates.username = username.trim();
    if (changingPassword) updates.password = password;
    if (imageFile) updates.imageFile = imageFile;
    return updates;
  };

  const submit = async (currentPasswordForRequest) => {
    setSaving(true);
    setError('');
    setModalError('');
    try {
      await updateUser(buildUpdates(), currentPasswordForRequest || undefined);
      navigate(-1);
    } catch (err) {
      const message = err.message || 'Something went wrong. Please try again.';
      if (step === 'confirm-password') {
        setModalError(message);
      } else {
        setError(message);
        setStep('idle');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!canSave || saving) return;

    if (changingPassword && infoChanged) {
      setWarningType('both');
      setStep('cooldown-warning');
      return;
    }

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
      await submit(hasPassword ? currentPassword : undefined);
      return;
    }
    // 'info' or 'both' still need explicit password confirmation.
    setStep('confirm-password');
  };

  const handleConfirmPassword = async () => {
    if (hasPassword && !confirmPasswordInput) {
      setModalError('Please enter your current password.');
      return;
    }
    setModalError('');
    const pwd = warningType === 'both' ? (confirmPasswordInput || currentPassword) : confirmPasswordInput;
    await submit(hasPassword ? pwd : undefined);
    setConfirmPasswordInput('');
  };

  const closeModal = () => {
    setStep('idle');
    setWarningType(null);
    setConfirmPasswordInput('');
    setModalError('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  const infoWarningText = () => {
    if (warningType === 'both') {
      return (
        <>
          Once you save, you won&apos;t be able to update your <strong>profile info</strong> or
          change your <strong>password</strong> again for <strong>7 days</strong>. Do you want to continue?
        </>
      );
    }
    if (warningType === 'password') {
      return (
        <>
          Once you save, you won&apos;t be able to change your <strong>password</strong> again for{' '}
          <strong>7 days</strong>. Do you want to continue?
        </>
      );
    }
    return (
      <>
        Once you save these changes, you won&apos;t be able to update your <strong>profile info</strong>{' '}
        again for <strong>7 days</strong>. Do you want to continue?
      </>
    );
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Edit Profile" />

      <div className="p-5 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="relative w-24 h-24">
            <button
              onClick={handlePickImage}
              disabled={saving}
              className="relative w-24 h-24 rounded-full active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
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
            {imageFile && !saving && (
              <button
                onClick={handleRemovePhoto}
                aria-label="Remove selected photo"
                className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <X size={13} />
              </button>
            )}
          </div>
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

        {infoDaysLeft > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            You can edit your name or username again in {infoDaysLeft} day(s).
          </p>
        )}
        {passwordDaysLeft > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            You can change your password again in {passwordDaysLeft} day(s).
          </p>
        )}

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
            <p className="text-sm font-semibold text-gray-900">
              {hasPassword ? 'Change Password' : 'Set a Password'}
            </p>

            {hasPassword && (
              <div>
                <label className={labelClass}>Current password</label>
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to set a new password"
                />
              </div>
            )}

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
            <p className="text-sm text-gray-600">{infoWarningText()}</p>
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
            {hasPassword && (
              <div>
                <label className={labelClass}>Current password</label>
                <PasswordInput
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
            )}
            {modalError && <p className="text-xs text-red-500">{modalError}</p>}
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