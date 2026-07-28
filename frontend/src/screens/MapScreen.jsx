import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import MaterialTag from '../components/common/MaterialTag';
import { mockPinnedSites } from '../data/mockSpots';

// Pins come from ResourceSpotScreen reports (Integration Lead wires actual
// geolocation/map rendering).

export default function MapScreen() {
  const [selectedId, setSelectedId] = useState(null);

  const toggleSite = (id) => setSelectedId((prev) => (prev === id ? null : id));

  return (
    <div className="pb-24">
      <Header />

      {/* Map container placeholder — actual map rendering/pins logic = Integration Lead.
          Frontend only needs to render pin markers given lat/long + labels. View-only,
          no "Join" interaction (that flow was scrapped per team decision). */}
      <div className="relative w-full h-56 bg-gray-200 flex items-center justify-center">
        <p className="text-sm text-gray-400">Map view (pins rendered by Integration Lead)</p>
        {mockPinnedSites.map((site, i) => (
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
        {mockPinnedSites.map((site) => {
          const expanded = selectedId === site.id;
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
                  <p className="text-xs text-gray-400 mt-0.5">{site.distanceKm} km away</p>
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
