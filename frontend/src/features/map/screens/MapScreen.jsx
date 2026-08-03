import { useEffect, useRef, useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import Header from '@/shared/components/layout/Header';
import BottomNav from '@/shared/components/layout/BottomNav';
import MaterialTag from '@/shared/components/common/MaterialTag';
import { fetchResourceSpots, markResourceSpotCollected, addResourceSpotPhoto } from '@/shared/services/api';
import { getDistanceKm } from '@/features/map/geo';

export default function MapScreen() {
  const [selectedId, setSelectedId] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const fileInputRef = useRef(null);
  const photoTargetId = useRef(null);

  const loadSpots = () => {
    setLoading(true);
    setError('');
    fetchResourceSpots()
      .then(setSpots)
      .catch((err) => setError(err.message || 'Could not load resource spots.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadSpots, []);

  const toggleSite = (id) => setSelectedId((prev) => (prev === id ? null : id));

  const handleMarkCollected = async (id) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await markResourceSpotCollected(id);
      loadSpots();
    } catch (err) {
      setError(err.message || 'Could not mark this spot collected.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAddPhotoClick = (id) => {
    photoTargetId.current = id;
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    const id = photoTargetId.current;
    e.target.value = '';
    if (!file || !id) return;
    setBusyId(id);
    try {
      await addResourceSpotPhoto(id, file);
      loadSpots();
    } catch (err) {
      setError(err.message || 'Could not add photo.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="pb-24">
      <Header />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* Map container placeholder — no real coordinates from the backend, pins
          are laid out by index instead of lat/long. */}
      <div className="relative w-full h-56 bg-gray-200 flex items-center justify-center">
        <p className="text-sm text-gray-400">Map view</p>
        {spots.map((site, i) => (
          <button
            key={site.id}
            onClick={() => toggleSite(site.id)}
            className="absolute"
            style={{ left: `${25 + i * 22}%`, top: `${35 + (i % 2) * 20}%` }}
          >
            <MapPin
              size={28}
              className={selectedId === site.id ? 'text-brand-700 fill-brand-200' : 'text-brand-600 fill-brand-100'}
            />
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nearby reported sites</p>

        {loading && <p className="text-center text-sm text-gray-400 py-8">Loading...</p>}
        {!loading && error && <p className="text-center text-sm text-red-500 py-4">{error}</p>}
        {!loading && !error && spots.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No resource spots reported yet.</p>
        )}

        {!loading &&
          spots.map((site) => {
            const expanded = selectedId === site.id;
            const distanceKm = getDistanceKm(site.location);
            const isBusy = busyId === site.id;
            return (
              <div
                key={site.id}
                className={`bg-white border rounded-xl overflow-hidden ${
                  expanded ? 'border-brand-500' : 'border-gray-100'
                }`}
              >
                <button
                  onClick={() => toggleSite(site.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{site.name}</p>
                    {distanceKm != null && <p className="text-xs text-gray-400 mt-0.5">{distanceKm} km away</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <MaterialTag material={site.material} />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-2">
                    <div className="aspect-[4/3] rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                      {site.image && (
                        <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex gap-6 text-sm pt-2">
                      {site.weightKg != null && (
                        <span><span className="font-semibold">{site.weightKg}kg</span> weight</span>
                      )}
                      {site.quantity != null && (
                        <span><span className="font-semibold">{site.quantity}</span> quantity</span>
                      )}
                    </div>
                    {site.location && <p className="text-sm text-gray-500">📍 {site.location}</p>}
                    {site.description && (
                      <p className="text-sm text-gray-600 italic">&ldquo;{site.description}&rdquo;</p>
                    )}
                    {site.permissionNote && (
                      <p className="text-xs text-gray-400">Access notes: {site.permissionNote}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleAddPhotoClick(site.id)}
                        disabled={isBusy}
                        className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold disabled:opacity-50"
                      >
                        Add photo
                      </button>
                      <button
                        onClick={() => handleMarkCollected(site.id)}
                        disabled={isBusy}
                        className="flex-1 py-2.5 rounded-lg bg-brand-600 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {isBusy ? 'Working...' : 'Mark Collected'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <BottomNav />
    </div>
  );
}
