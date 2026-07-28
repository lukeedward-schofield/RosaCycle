// Placeholder data so screens have something to render during frontend development.
// Backend Lead's API will eventually replace this.
//
// Mock scope: Santa Rosa, Laguna. The mock current user is based in Sinalhan —
// distanceKm is derived from `location` via getDistanceKm (see data/geo.js),
// not hand-picked, so the two can never drift out of sync.
//
// tradingFor follows the doc spec: { type: 'specific' | 'nothing' | 'negotiating', value?: string }
import { getDistanceKm } from './geo';

export const mockTrades = [
  {
    id: 'trade-1',
    name: 'Old Woods',
    material: 'Wood',
    image: null,
    location: 'Balibago, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Balibago, Santa Rosa, Laguna'),
    posterName: 'Luke',
    weightKg: 4.5,
    quantity: 1,
    tradingFor: { type: 'specific', value: 'Paper or old magazines' },
    description: 'Nakaimbak nalang still good open for swap paper or old magazines will do.',
    hasOffers: true, // matches mockOfferHistory's offer-1 (Pending)
    offerAccepted: false,
  },
  {
    id: 'trade-2',
    name: 'Scrap Metal Pile',
    material: 'Metal',
    image: null,
    location: 'Dita, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Dita, Santa Rosa, Laguna'),
    posterName: 'Aero',
    weightKg: 6.2,
    quantity: 1,
    tradingFor: { type: 'negotiating' },
    description: 'Assorted steel scraps from a home renovation project.',
    hasOffers: true,
    offerAccepted: true, // chat unlocked: offer was accepted
  },
  {
    id: 'trade-3',
    name: 'Bulk Cardboard',
    material: 'Mixed',
    image: null,
    location: 'Pulong Santa Cruz, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Pulong Santa Cruz, Santa Rosa, Laguna'),
    posterName: 'Franz',
    weightKg: 15.0,
    quantity: 9,
    tradingFor: { type: 'nothing' },
    description: 'Flattened boxes, dry and clean.',
    hasOffers: false,
    offerAccepted: false,
  },
  {
    id: 'trade-9',
    name: 'Fabric Scraps',
    material: 'Fabric',
    image: null,
    location: 'Caingin, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Caingin, Santa Rosa, Laguna'),
    posterName: 'Mika',
    weightKg: 2.0,
    quantity: 1,
    tradingFor: { type: 'negotiating' },
    description: 'Leftover cotton fabric from a home sewing project, various colors.',
    hasOffers: false,
    offerAccepted: false,
  },
  {
    id: 'trade-10',
    name: 'Bond Paper Stack',
    material: 'Paper',
    image: null,
    location: 'Macabling, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Macabling, Santa Rosa, Laguna'),
    posterName: 'Ronnel',
    weightKg: 5.0,
    quantity: 3,
    tradingFor: { type: 'nothing' },
    description: 'Unused bond paper reams, slightly yellowed from storage.',
    hasOffers: false,
    offerAccepted: false,
  },
  {
    id: 'trade-11',
    name: 'Broken Electronics',
    material: 'E-waste',
    image: null,
    location: 'Don Jose, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Don Jose, Santa Rosa, Laguna'),
    posterName: 'Ivy',
    weightKg: 3.8,
    quantity: 2,
    tradingFor: { type: 'specific', value: 'Working USB cables' },
    description: 'Old router and a non-working power bank, good for parts.',
    hasOffers: false,
    offerAccepted: false,
  },
];

// Poster "You" is based in Sinalhan, so these are all ~0km from the mock user.
export const mockTrackTrades = [
  {
    id: 'trade-6',
    name: 'Assorted E-waste',
    material: 'E-waste',
    image: null,
    location: 'Purok 3, Sinalhan, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Sinalhan, Santa Rosa, Laguna'),
    posterName: 'You',
    weightKg: 3.5,
    quantity: 4,
    tradingFor: { type: 'specific', value: 'Working phone charger' },
    description: 'Old chargers, cables, and a broken keyboard.',
    hasOffers: true,
    offerAccepted: false, // Pending — offer received, awaiting your decision
  },
  {
    id: 'trade-4',
    name: 'Old Newspapers',
    material: 'Mixed',
    image: null,
    location: 'Purok 5, Sinalhan, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Sinalhan, Santa Rosa, Laguna'),
    posterName: 'You',
    weightKg: 2.8,
    quantity: 5,
    tradingFor: { type: 'negotiating' },
    description: 'Stack of newspapers from the past month.',
    hasOffers: true,
    offerAccepted: true, // Accepted — chat unlocked
  },
  {
    id: 'trade-5',
    name: 'Plastic Bottles',
    material: 'Plastic',
    image: null,
    location: 'Purok 1, Sinalhan, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Sinalhan, Santa Rosa, Laguna'),
    posterName: 'You',
    weightKg: 3.2,
    quantity: 20,
    tradingFor: { type: 'nothing' },
    description: 'Clean PET bottles, ready for pickup.',
    hasOffers: false,
    offerAccepted: false, // Pending — no offers yet
  },
  {
    id: 'trade-7',
    name: 'Broken Furniture Wood',
    material: 'Wood',
    image: null,
    location: 'Purok 2, Sinalhan, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Sinalhan, Santa Rosa, Laguna'),
    posterName: 'You',
    weightKg: 8.0,
    quantity: 2,
    tradingFor: { type: 'specific', value: 'Untreated plywood scraps' },
    description: 'Disassembled cabinet frame, still solid wood underneath the peeling veneer.',
    hasOffers: false,
    offerAccepted: false, // Pending — no offers yet
  },
  {
    id: 'trade-8',
    name: 'Copper Wiring',
    material: 'Metal',
    image: null,
    location: 'Purok 4, Sinalhan, Santa Rosa, Laguna',
    distanceKm: getDistanceKm('Sinalhan, Santa Rosa, Laguna'),
    posterName: 'You',
    weightKg: 1.2,
    quantity: 3,
    tradingFor: { type: 'nothing' },
    description: 'Stripped copper wire from an old appliance repair.',
    hasOffers: true,
    offerAccepted: false, // Pending — offer received, awaiting your decision
  },
];

// Offers YOU sent on other people's trades. Includes what you actually
// offered (itemName/material/weightKg/description) so "View Offer" can show
// a read-only record of it instead of re-running the create-offer flow.
export const mockOfferHistory = [
  {
    id: 'offer-1',
    tradeId: 'trade-1',
    tradeName: 'Old Woods',
    status: 'Pending',
    itemName: 'Old Bond Paper',
    material: 'Paper',
    image: null,
    weightKg: 2.0,
    description: 'Clean sheets, unused stock from an old office.',
  },
  {
    id: 'offer-2',
    tradeId: 'trade-2',
    tradeName: 'Scrap Metal Pile',
    status: 'Accepted',
    itemName: 'Aluminum Scraps',
    material: 'Metal',
    image: null,
    weightKg: 3.0,
    description: 'Soda cans and aluminum sheet cutoffs.',
  },
];

// Offers received on your own trades (mockTrackTrades), keyed by tradeId.
// Only trades with hasOffers: true have entries here. Per docs: "a trade can
// only have one active offer at a time" — so at most one Pending offer per
// trade; Declined entries show the trade's earlier offer history.
export const mockReceivedOffers = {
  'trade-6': [
    {
      id: 'roffer-1',
      offererName: 'Jhun',
      itemName: 'Working Phone Charger',
      material: 'Metal',
      image: null,
      weightKg: 0.3,
      status: 'Pending',
      createdAt: '2026-07-24',
    },
    {
      id: 'roffer-5',
      offererName: 'Karen',
      itemName: 'Old Extension Cord',
      material: 'Metal',
      image: null,
      weightKg: 0.5,
      status: 'Declined',
      createdAt: '2026-07-23',
    },
    {
      id: 'roffer-6',
      offererName: 'Paolo',
      itemName: 'Broken Laptop Charger',
      material: 'E-waste',
      image: null,
      weightKg: 0.4,
      status: 'Declined',
      createdAt: '2026-07-21',
    },
  ],
  'trade-4': [
    {
      id: 'roffer-2',
      offererName: 'Liza',
      itemName: 'Fresh Magazines',
      material: 'Paper',
      image: null,
      weightKg: 1.5,
      status: 'Accepted',
      createdAt: '2026-07-20',
    },
  ],
  'trade-8': [
    {
      id: 'roffer-4',
      offererName: 'Dennis',
      itemName: 'Rubber Tires',
      material: 'Mixed',
      image: null,
      weightKg: 5.0,
      status: 'Declined',
      createdAt: '2026-07-22',
    },
    {
      id: 'roffer-3',
      offererName: 'Marco',
      itemName: 'Aluminum Cans',
      material: 'Metal',
      image: null,
      weightKg: 2.0,
      status: 'Pending',
      createdAt: '2026-07-26',
    },
  ],
};

// Human-readable label for the tradingFor field per doc spec (x / nothing / open for negotiating)
export function formatTradingFor(tradingFor) {
  if (!tradingFor) return 'Open to offers';
  switch (tradingFor.type) {
    case 'specific':
      return tradingFor.value;
    case 'nothing':
      return 'Nothing (free item)';
    case 'negotiating':
      return 'Open for negotiating';
    default:
      return 'Open to offers';
  }
}

// Derives a trade's lifecycle status: Pending (open, whether or not it has an
// offer yet awaiting your decision) -> Accepted (offer accepted, chat unlocked).
export function getTradeStatus(trade) {
  return trade.offerAccepted ? 'Accepted' : 'Pending';
}
