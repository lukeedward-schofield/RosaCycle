import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { APIProvider, AdvancedMarker, Map, Pin, useMap, } from '@vis.gl/react-google-maps';
import Header from '@/shared/components/layout/Header';
import BottomNav from '@/shared/components/layout/BottomNav';
import MaterialTag from '@/shared/components/common/MaterialTag';
import { useAuth } from '@/features/auth/AuthContext';
import { SPOT_MATERIAL_OPTIONS } from '@/shared/utils/constants';
import {
  addResourceSpotPhoto,
  deleteResourceSpot,
  fetchResourceSpots,
  updateResourceSpot,
} from '@/shared/services/api';
import { getDistanceKm } from '@/features/map/geo';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const SANTA_ROSA_CENTER = {
  lat: 14.2843,
  lng: 121.0889,
};

const SANTA_ROSA_BOUNDS = {
  north: 14.36,
  south: 14.20,
  east: 121.18,
  west: 121.00,
};

const inputClass =
  'w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500';
const labelClass = 'text-xs font-semibold text-gray-500 mb-1 block';

function ResourceSpotMarkers({ spots, selectedId, onSelect }) {
  const map = useMap();

   useEffect(() => {
    console.log("Loaded spots:");
    spots.forEach(spot => {
      console.log(spot.name, spot.latitude, spot.longitude);
    });
  }, [spots]);


  useEffect(() => {
    if (!map) return;

    const markerPositions = spots
      .filter(s => s.latitude != null && s.longitude != null)
      .map(s => ({
        lat: Number(s.latitude),
        lng: Number(s.longitude),
      }));

    if (markerPositions.length === 0) return;

    if (markerPositions.length === 1) {
      map.panTo(markerPositions[0]);
      map.setZoom(15);
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    markerPositions.forEach(position => bounds.extend(position));

  }, [map, spots]);

  return (
    <>
      {spots
        .filter(s => s.latitude != null && s.longitude != null)
        .map(spot => (
          <AdvancedMarker
            key={spot.id}
            position={{
              lat: Number(spot.latitude),
              lng: Number(spot.longitude),
            }}
            title={`${spot.name} — ${spot.material}`}
            onClick={() => onSelect(spot.id)}
            zIndex={selectedId === spot.id ? 2 : 1}
          >
            <Pin
              background={selectedId === spot.id ? "#15803d" : "#22c55e"}
              borderColor="#166534"
              glyphColor="#ffffff"
            />
          </AdvancedMarker>
        ))}
    </>
  );
}

function createEditForm(site) {
  return {
    name: site.name ?? '',
    material: site.material ?? '',
    weightKg: site.weightKg ?? '',
    quantity: site.quantity ?? '',
    description: site.description ?? '',
    locationText: site.location ?? '',
    permissionNote: site.permissionNote ?? '',
  };
}

export default function MapScreen() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const fileInputRef = useRef(null);
  const photoTargetId = useRef(null);

  const loadSpots = async () => {
    setLoading(true);
    setError('');
    try {
      const loadedSpots = await fetchResourceSpots();
      setSpots(loadedSpots);
    } catch (err) {
      setError(err.message || 'Could not load resource spots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpots();
  }, []);

  const ownSpots = spots.filter((spot) => spot.reporterId === user?.id);
  const otherSpots = spots.filter((spot) => spot.reporterId !== user?.id);

  const toggleSite = (id) => {
    setSelectedId((previous) => (previous === id ? null : id));
    if (editingId && editingId !== id) {
      setEditingId(null);
      setEditForm(null);
    }
  };

  const startEditing = (site) => {
    setSelectedId(site.id);
    setEditingId(site.id);
    setEditForm(createEditForm(site));
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveEdit = async (id) => {
    if (busyId || !editForm) return;
    if (!editForm.name.trim() || !editForm.material || !editForm.locationText.trim()) {
      setError('Name, material, and location are required.');
      return;
    }

    setBusyId(id);
    setError('');
    try {
      await updateResourceSpot(id, {
        name: editForm.name.trim(),
        material: editForm.material,
        weightKg: editForm.weightKg === '' ? null : editForm.weightKg,
        quantity: editForm.quantity === '' ? null : editForm.quantity,
        description: editForm.description.trim(),
        locationText: editForm.locationText.trim(),
        permissionNote: editForm.permissionNote.trim(),
      });
      setEditingId(null);
      setEditForm(null);
      await loadSpots();
      setSelectedId(id);
    } catch (err) {
      setError(err.message || 'Could not update this resource spot.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (busyId) return;
    const confirmed = window.confirm(
      'Delete this resource spot? It will be removed from the map and cannot be restored.',
    );
    if (!confirmed) return;

    setBusyId(id);
    setError('');
    try {
      await deleteResourceSpot(id);
      if (selectedId === id) setSelectedId(null);
      if (editingId === id) cancelEditing();
      await loadSpots();
    } catch (err) {
      setError(err.message || 'Could not delete this resource spot.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAddPhotoClick = (id) => {
    photoTargetId.current = id;
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = async (event) => {
    const file = event.target.files?.[0];
    const id = photoTargetId.current;
    event.target.value = '';
    if (!file || !id) return;

    setBusyId(id);
    setError('');
    try {
      await addResourceSpotPhoto(id, file);
      await loadSpots();
      setSelectedId(id);
    } catch (err) {
      setError(err.message || 'Could not add photo.');
    } finally {
      setBusyId(null);
    }
  };

  const renderSpotCard = (site, isOwner) => {
    const expanded = selectedId === site.id;
    const isEditing = editingId === site.id;
    // Distance calculation is nn hold
    const distanceKm = null;
    const isBusy = busyId === site.id;

    return (
      <div
        key={site.id}
        className={`bg-white border rounded-xl overflow-hidden ${
          expanded ? 'border-brand-500' : 'border-gray-100'
        }`}
      >
        <button
          type="button"
          onClick={() => toggleSite(site.id)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <p className="font-semibold text-gray-900 text-sm">{site.name}</p>
            {distanceKm != null && (
              <p className="text-xs text-gray-400 mt-0.5">{distanceKm} km away</p>
            )}
            {!isOwner && site.reporterName && (
              <p className="text-xs text-gray-400 mt-0.5">Posted by {site.reporterName}</p>
            )}
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
          <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-3">
            {isEditing && editForm ? (
              <>
                <div>
                  <label className={labelClass}>Spot name</label>
                  <input
                    className={inputClass}
                    value={editForm.name}
                    onChange={(event) => handleEditChange('name', event.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Material</label>
                  <select
                    className={inputClass}
                    value={editForm.material}
                    onChange={(event) => handleEditChange('material', event.target.value)}
                  >
                    {SPOT_MATERIAL_OPTIONS.map((material) => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={editForm.weightKg}
                      onChange={(event) => handleEditChange('weightKg', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className={inputClass}
                      value={editForm.quantity}
                      onChange={(event) => handleEditChange('quantity', event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    value={editForm.locationText}
                    onChange={(event) => handleEditChange('locationText', event.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={`${inputClass} min-h-[80px] resize-none`}
                    value={editForm.description}
                    onChange={(event) => handleEditChange('description', event.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Permission / access notes</label>
                  <textarea
                    className={`${inputClass} min-h-[70px] resize-none`}
                    value={editForm.permissionNote}
                    onChange={(event) => handleEditChange('permissionNote', event.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={isBusy}
                    className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(site.id)}
                    disabled={isBusy}
                    className="flex-1 py-2.5 rounded-lg bg-brand-600 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {isBusy ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="aspect-[4/3] rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                  {site.image && (
                    <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex gap-6 text-sm pt-1">
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

                {isOwner ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(site)}
                        disabled={isBusy}
                        className="flex-1 py-2.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPhotoClick(site.id)}
                        disabled={isBusy}
                        className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold disabled:opacity-50"
                      >
                        Change Photo
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(site.id)}
                      disabled={isBusy}
                      className="w-full py-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold disabled:opacity-50"
                    >
                      {isBusy ? 'Deleting...' : 'Delete Spot'}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    );
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

      <div className="w-full h-64 bg-gray-200">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="h-full flex items-center justify-center px-6 text-center">
            <p className="text-sm text-red-500">
              Google Maps API key is missing. Check frontend/.env.local.
            </p>
          </div>
        ) : (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={SANTA_ROSA_CENTER}
              defaultZoom={14}
              minZoom={13}
              maxZoom={19}
              restriction={{
                latLngBounds: SANTA_ROSA_BOUNDS,
                strictBounds: false,
              }}
              gestureHandling="greedy"
              disableDefaultUI={false}
              style={{ width: '100%', height: '100%' }}
            >
              <ResourceSpotMarkers
                spots={spots}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </Map>
          </APIProvider>
        )}
      </div>

      <div className="px-4 pt-4 space-y-5">
        {loading && <p className="text-center text-sm text-gray-400 py-8">Loading...</p>}
        {!loading && error && <p className="text-center text-sm text-red-500 py-2">{error}</p>}
        {!loading && !error && spots.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No resource spots reported yet.</p>
        )}

        {!loading && spots.length > 0 && (
          <>
            <section className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Your resource spots
              </p>
              {ownSpots.length > 0 ? (
                ownSpots.map((site) => renderSpotCard(site, true))
              ) : (
                <p className="text-sm text-gray-400 py-3">You have no active resource spots.</p>
              )}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Other nearby resource spots
              </p>
              {otherSpots.length > 0 ? (
                otherSpots.map((site) => renderSpotCard(site, false))
              ) : (
                <p className="text-sm text-gray-400 py-3">No other active resource spots nearby.</p>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
