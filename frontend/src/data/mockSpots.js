// Placeholder data so the Map has pins to render during frontend development.
// Real pins come from ResourceSpotScreen reports once Backend Lead's API is live.
//
// Mock scope: Santa Rosa, Laguna, same as mockTrades.js — distanceKm derived
// from location via getDistanceKm (see data/geo.js).
import { getDistanceKm } from './geo';

export const mockPinnedSites = [
  {
    id: 'site-1',
    name: 'Garbage Pile',
    location: 'Tagapo, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Tagapo, Santa Rosa, Laguna'),
    material: 'Plastic',
    image: null,
    weightKg: 6.5,
    quantity: 12,
    description: 'Pile of plastic bottles and containers left near the sari-sari store.',
    permissionNote: 'Public area, no permission needed.',
  },
  {
    id: 'site-2',
    name: 'Overgrown Lot',
    location: 'Market Area, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Market Area, Santa Rosa, Laguna'),
    material: 'Mixed',
    image: null,
    weightKg: 15.0,
    quantity: 5,
    description: 'Vacant lot with scattered scrap metal and cardboard.',
    permissionNote: 'Ask barangay caretaker first.',
  },
  {
    id: 'site-3',
    name: 'Drain Blockage',
    location: 'Malusak, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Malusak, Santa Rosa, Laguna'),
    material: 'Organic',
    image: null,
    weightKg: 3.0,
    quantity: 1,
    description: 'Clogged drain with leaves and organic debris.',
    permissionNote: 'Public drainage, no permission needed.',
  },
];

export const SPOT_MATERIAL_OPTIONS = [
  'Wood',
  'Metal',
  'Plastic',
  'Fabric',
  'Paper',
  'E-waste',
  'Mixed',
  'Organic',
];
