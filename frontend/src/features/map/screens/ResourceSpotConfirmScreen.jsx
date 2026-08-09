import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import { SPOT_MATERIAL_OPTIONS } from '@/shared/utils/constants';
import {
  reportResourceSpot,
  assessResourceSpotPhoto,
} from '@/shared/services/api';
import { getPendingCapture, clearPendingCapture } from '@/shared/lib/pendingCapture';
import GpsLocationAutofill from '@/shared/components/location/GpsLocationAutofill';

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
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [permissionNote, setPermissionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageRejected, setImageRejected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const imageFile = getPendingCapture();
  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  useEffect(() => {
  if (!imageFile) return;

  const scan = async () => {
    try {
      setScanning(true);

      const result = await assessResourceSpotPhoto(imageFile);
      console.log("Gemini returned:", result);

      if (result.isRelevant === false) {
        setImageRejected(true);
        setName("");
        setMaterial("");
        setWeightKg("");
        setQuantity("");
        setDescription("");
        setError(
          "This photo does not appear to show reusable or recoverable material for a resource spot. Please retake the photo."
        );
        return;
      }

      setImageRejected(false);
      setName(result.name || "");
      setMaterial(result.material || "");
      setWeightKg(result.weightKg?.toString() || "");
      setQuantity(result.quantity?.toString() || "");
      setDescription(result.description || "");

      // if your backend returns confidence
      if (result.locationText)
        setLocationText(result.locationText);

    } catch (err) {
      console.error(err);
      setError("AI couldn't analyze this image.");
    } finally {
      setScanning(false);
    }
  };

  scan();
}, [imageFile]);

  const handleGpsLocation = ({
    latitude: nextLatitude,
    longitude: nextLongitude,
    locationText: nextLocationText,
    reverseGeocoded,
  }) => {
    const coordinateFallback = `${nextLatitude.toFixed(6)}, ${nextLongitude.toFixed(6)}`;

    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    setLocationText((currentLocationText) => {
      const currentLocation = currentLocationText.trim();
      if (!currentLocation || (reverseGeocoded && currentLocation === coordinateFallback)) {
        return nextLocationText;
      }
      return currentLocationText;
    });
    setLocating(false);
    setLocationError(false);
  };

  const handleGpsError = (gpsError) => {
    console.error('GPS ERROR:', gpsError);
    setLocating(false);
    setLocationError(true);
  };

  const canSubmit = !imageRejected && name.trim().length > 0 && material && locationText.trim().length > 0;

  const handleRetakeRejectedPhoto = () => {
    clearPendingCapture();
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      console.log("Submitting GPS:", latitude, longitude);
      const saved = await reportResourceSpot(
        {
          name: name.trim(),
          material,
          weightKg: Number(weightKg) || undefined,
          quantity: Number(quantity) || undefined,
          description: description.trim(),
          locationText: locationText.trim(),

         latitude,
         longitude,

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
      <GpsLocationAutofill onLocation={handleGpsLocation} onError={handleGpsError} />
      <Header onBack={() => navigate(-1)} title="Report Spot" />

      <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Captured spot" className="w-full h-full object-cover" />
        ) : (
          'No photo captured'
        )}
      </div>

      <div className="p-5 space-y-6">
        {scanning && (
    <div className="bg-blue-50 text-blue-700 rounded-lg p-3 mb-4 text-sm">
    🔍 AI is analyzing the image...
  </div>
)}
        {imageRejected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">Photo not accepted</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
            <PrimaryButton onClick={handleRetakeRejectedPhoto}>Retake Photo</PrimaryButton>
          </div>
        ) : (
          <>
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
          {locating && <p className="text-xs text-gray-400 mt-1">📍 Getting your GPS location...</p>}
          {!locating && !locationError && latitude != null && (
         <p className="text-xs text-green-600 mt-1">📍 Location captured</p>
          )}
          {!locating && locationError && (
           <p className="text-xs text-amber-600 mt-1">📍 Couldn't get GPS — pin will use the typed address only</p>
         )}
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

        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit || submitting || scanning}>
          {scanning
            ? 'Analyzing...'
            : submitting
            ? 'Reporting...'
            : 'Report Spot'}
        </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}
