import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import { mockTrackTrades } from '../data/mockTrades';

const inputClass =
  'w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500';
const labelClass = 'text-xs font-semibold text-gray-500 mb-1.5 block';

const TRADE_FOR_OPTIONS = [
  { key: 'specific', label: 'Specific item' },
  { key: 'nothing', label: 'Nothing' },
  { key: 'negotiating', label: 'Negotiable' },
];

/**
 * Edits one of your own trades (mockTrackTrades). Mock only — mutates the
 * trade object in place (same pattern as the auth mock users) so the change
 * shows up immediately across the app for this session, without a backend.
 */
export default function EditListingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trade = mockTrackTrades.find((t) => t.id === id);

  const [name, setName] = useState(trade?.name || '');
  const [description, setDescription] = useState(trade?.description || '');
  const [weightKg, setWeightKg] = useState(trade?.weightKg ?? '');
  const [quantity, setQuantity] = useState(trade?.quantity ?? '');
  const [tradingForType, setTradingForType] = useState(trade?.tradingFor?.type || 'negotiating');
  const [tradingForValue, setTradingForValue] = useState(trade?.tradingFor?.value || '');

  if (!trade) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Edit Listing" />
        <p className="text-center text-sm text-gray-400 py-16">Listing not found.</p>
      </div>
    );
  }

  const canSave = name.trim().length > 0 && Number(weightKg) > 0 && Number(quantity) > 0;

  const handleSave = () => {
    if (!canSave) return;
    trade.name = name.trim();
    trade.description = description.trim();
    trade.weightKg = Number(weightKg);
    trade.quantity = Number(quantity);
    trade.tradingFor =
      tradingForType === 'specific'
        ? { type: 'specific', value: tradingForValue.trim() }
        : { type: tradingForType };
    navigate(`/trades/${trade.id}?owner=1`, { replace: true });
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Edit Listing" />

      <div className="p-5 space-y-5">
        <div>
          <label className={labelClass}>Item name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Caption</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Trade for</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {TRADE_FOR_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTradingForType(opt.key)}
                className={`py-2 rounded-lg text-xs font-medium ${
                  tradingForType === opt.key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {tradingForType === 'specific' && (
            <input
              className={inputClass}
              value={tradingForValue}
              onChange={(e) => setTradingForValue(e.target.value)}
              placeholder="e.g. Paper or old magazines"
            />
          )}
        </div>

        <PrimaryButton onClick={handleSave} disabled={!canSave}>
          Save Changes
        </PrimaryButton>
      </div>
    </div>
  );
}
