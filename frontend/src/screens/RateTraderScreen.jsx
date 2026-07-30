import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import StarRating from '../components/common/StarRating';
import { fetchTradeById, submitRating } from '../services/api';

export default function RateTraderScreen() {
  const navigate = useNavigate();
  const { tradeId } = useParams();
  const [trade, setTrade] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTradeById(tradeId).then(setTrade).catch(() => setTrade(null));
  }, [tradeId]);

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await submitRating(tradeId, rating, comment.trim() || undefined);
      navigate('/trades');
    } catch (err) {
      setError(err.message || 'Could not submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Rate Trader" showBell={false} />

      <div className="px-5 pt-6 space-y-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          Rate your trade with {trade?.posterName || 'the trader'}
        </h1>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-left">
          <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">{trade?.name || 'Trade item'}</p>
            <p className="text-xs text-gray-400">Completed trade</p>
          </div>
        </div>

        <StarRating value={rating} onChange={setRating} />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a note about this trade (optional)"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none min-h-[90px] resize-none text-left"
        />

        {error && <p className="text-sm text-red-500 text-left">{error}</p>}

        <div className="space-y-3 pt-2">
          <PrimaryButton disabled={rating === 0 || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </PrimaryButton>
          <button onClick={() => navigate('/trades')} className="text-sm text-gray-500 font-medium">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
