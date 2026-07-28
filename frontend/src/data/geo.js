// Mock data scope: Santa Rosa, Laguna only. The mock current user is based in
// Sinalhan, so every other barangay's distance is computed relative to that —
// single source of truth instead of hand-picked distanceKm numbers that can
// drift out of sync with the location text (that mismatch was a real bug once
// already, see mockTrackTrades history).
//
// Distances are straight-line approximations for demo purposes, not routed.
const BARANGAY_DISTANCE_FROM_USER_KM = {
  Sinalhan: 0,
  Tagapo: 1.1,
  Ibaba: 1.3,
  'Market Area': 1.6,
  Kanluran: 1.8,
  Malusak: 2.0,
  Pooc: 2.1,
  Labas: 2.4,
  Aplaya: 2.7,
  Dila: 3.0,
  Dita: 3.2,
  Caingin: 3.5,
  'Santo Domingo': 3.8,
  Macabling: 4.0,
  Malitlit: 4.6,
  'Pulong Santa Cruz': 5.2,
  Balibago: 5.5,
  'Don Jose': 6.0,
};

export const SANTA_ROSA_BARANGAYS = Object.keys(BARANGAY_DISTANCE_FROM_USER_KM);

// `location` is a full string like "Balibago, Santa Rosa, Laguna" — match it
// against the known barangay names rather than requiring an exact key.
export function getDistanceKm(location) {
  if (!location) return null;
  const barangay = SANTA_ROSA_BARANGAYS.find((b) => location.includes(b));
  return barangay ? BARANGAY_DISTANCE_FROM_USER_KM[barangay] : null;
}
