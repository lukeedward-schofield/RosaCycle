import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Camera, Star } from 'lucide-react';
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
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const changingPassword = currentPassword.length > 0 || password.length > 0 || confirmPassword.length > 0;

  const hasChanges =
    firstName.trim() !== (user?.firstName || '') ||
    lastName.trim() !== (user?.lastName || '') ||
    username.trim() !== (user?.username || '') ||
    email.trim() !== (user?.email || '') ||
    changingPassword ||
    imageFile !== null;

  const canSave =
    hasChanges &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    (!changingPassword ||
      (currentPassword.length > 0 && password.length >= 6 && password === confirmPassword));

  const initial = firstName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?';

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

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
      if (imageFile) updates.imageFile = imageFile;
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
    </div>
  );
}