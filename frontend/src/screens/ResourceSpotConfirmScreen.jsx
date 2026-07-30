import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import { SPOT_MATERIAL_OPTIONS } from '../utils/constants';
import { reportResourceSpot } from '../services/api';
import { getPendingCapture, clearPendingCapture } from '../lib/pendingCapture';

const inputClass =
  'w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500';
const labelClass = 'text-xs font-semibold text-gray-500 mb-1.5 block';

export default function ResourceSpotConfirmScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [material, setMaterial] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [permissionNote, setPermissionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const imageFile = getPendingCapture();
  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;

  const canSubmit = name.trim().length > 0 && material && locationText.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const saved = await reportResourceSpot(
        {
          name: name.trim(),
          material,
          weightKg: Number(weightKg) || undefined,
          quantity: Number(quantity) || undefined,
          description: description.trim(),
          locationText: locationText.trim(),
          permissionNote: permissionNote.trim(),
        },
        imageFile
      );
      clearPendingCapture();
      navigate('/camera/reported', { state: { spot: saved } });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Report Spot" />

      <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Captured spot" className="w-full h-full object-cover" />
        ) : (
          'No photo captured'
        )}
      </div>

      <div className="p-5 space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            AI-Detected (editable)
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Material spotted</label>
              <div className="grid grid-cols-3 gap-2">
                {SPOT_MATERIAL_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMaterial(opt)}
                    className={`py-2 rounded-lg text-xs font-medium ${
                      material === opt ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Estimated weight (kg)</label>
              <input
                type="number"
                className={inputClass}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 4.0"
              />
            </div>
            <div>
              <label className={labelClass}>Estimated quantity</label>
              <input
                type="number"
                className={inputClass}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Spot name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Overgrown Lot"
          />
        </div>

        <div>
          <label className={labelClass}>Description (optional)</label>
          <textarea
            className={`${inputClass} min-h-[90px] resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you find here?"
          />
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input
            className={inputClass}
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="e.g. Tagapo, Santa Rosa, Laguna"
          />
        </div>

        <div>
          <label className={labelClass}>Permission / access notes (optional)</label>
          <textarea
            className={`${inputClass} min-h-[70px] resize-none`}
            value={permissionNote}
            onChange={(e) => setPermissionNote(e.target.value)}
            placeholder="e.g. Public lot, no permission needed / Ask caretaker first"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Reporting...' : 'Report Spot'}
        </PrimaryButton>
      </div>
    </div>
  );
}
