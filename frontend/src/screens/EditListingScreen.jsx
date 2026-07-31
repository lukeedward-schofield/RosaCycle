import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import { fetchTradeById, updateTrade } from '../services/api';

const inputClass =
  'w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500';
const labelClass = 'text-xs font-semibold text-gray-500 mb-1.5 block';

const TRADE_FOR_OPTIONS = [
  { key: 'specific', label: 'Specific item' },
  { key: 'nothing', label: 'Nothing' },
  { key: 'negotiating', label: 'Negotiable' },
];

export default function EditListingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [quantity, setQuantity] = useState('');
  const [tradingForType, setTradingForType] = useState('negotiating');
  const [tradingForValue, setTradingForValue] = useState('');

  useEffect(() => {
    fetchTradeById(id)
      .then((data) => {
        setTrade(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setWeightKg(data.weightKg ?? '');
        setQuantity(data.quantity ?? '');
        setTradingForType(data.tradingFor?.type || 'negotiating');
        setTradingForValue(data.tradingFor?.value || '');
      })
      .catch(() => setTrade(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Edit Listing" />
        <p className="text-center text-sm text-gray-400 py-16">Loading...</p>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Edit Listing" />
        <p className="text-center text-sm text-gray-400 py-16">Listing not found.</p>
      </div>
    );
  }

  const canSave = name.trim().length > 0 && Number(weightKg) > 0 && Number(quantity) > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await updateTrade(trade.id, {
        itemName: name.trim(),
        description: description.trim(),
        weightKg: Number(weightKg),
        quantity: Number(quantity),
        tradingForType,
        tradingForValue: tradingForType === 'specific' ? tradingForValue.trim() : undefined,
      });
      navigate(`/trades/${trade.id}?owner=1`, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
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

        {error && <p className="text-sm text-red-500">{error}</p>}

        <PrimaryButton onClick={handleSave} disabled={!canSave}>
          {saving ? 'Saving...' : 'Save Changes'}
        </PrimaryButton>
      </div>
    </div>
  );
}
