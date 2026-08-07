import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import StarRating from '@/shared/components/common/StarRating';
import { useAuth } from '@/features/auth/AuthContext';
import {
  fetchOffersForTrade,
  fetchTradeById,
  fetchUserRatings,
  submitRating,
} from '@/shared/services/api';

export default function RateTraderScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tradeId } = useParams();
  const { user } = useAuth();

  const returnTo = location.state?.returnTo || `/trades/${tradeId}/messages`;

  const [trade, setTrade] = useState(null);
  const [partnerName, setPartnerName] = useState(location.state?.partnerName || '');
  const [existingRating, setExistingRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTradeAndPartner() {
      try {
        const tradeData = await fetchTradeById(tradeId);
        if (cancelled) return;
        setTrade(tradeData);

        let otherUser = {
          id: tradeData.posterId,
          name: tradeData.posterName,
        };

        if (user?.id === tradeData.posterId) {
          const offers = await fetchOffersForTrade(tradeId);
          const acceptedOffer = offers.find((offer) => offer.status === 'accepted');
          if (acceptedOffer) {
            otherUser = {
              id: acceptedOffer.offererId,
              name: acceptedOffer.offererName,
            };
          }
        }

        if (cancelled) return;
        setPartnerName(otherUser.name || location.state?.partnerName || 'the trader');

        if (otherUser.id && user?.id) {
          const ratingData = await fetchUserRatings(otherUser.id);
          const previous = ratingData.ratings?.find(
            (item) => item.tradeId === tradeId && item.raterId === user.id
          );

          if (!cancelled && previous) {
            setExistingRating(previous);
            setRating(previous.score);
            setComment(previous.comment || '');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setTrade(null);
          setError(err.message || 'Could not load this trade.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTradeAndPartner();

    return () => {
      cancelled = true;
    };
  }, [tradeId, user?.id, location.state?.partnerName]);

  const handleSubmit = async () => {
    if (rating === 0 || submitting || existingRating) return;
    setSubmitting(true);
    setError('');
    try {
      await submitRating(tradeId, rating, comment.trim() || undefined);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Rate Trader" showBell={false} />
        <p className="text-center text-sm text-gray-400 py-16">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Rate Trader" showBell={false} />

      <div className="px-5 pt-6 space-y-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          Rate your trade with {partnerName || 'the trader'}
        </h1>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-left">
          <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
            {trade?.image && (
              <img src={trade.image} alt={trade.name || 'Trade item'} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{trade?.name || 'Trade item'}</p>
            <p className="text-xs text-gray-400">Completed trade</p>
          </div>
        </div>

        <StarRating value={rating} onChange={existingRating ? undefined : setRating} />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a note about this trade (optional)"
          maxLength={500}
          disabled={!!existingRating}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none min-h-[90px] resize-none text-left disabled:text-gray-500"
        />

        {existingRating && (
          <p className="text-sm text-gray-500 text-left">
            You already rated this user {existingRating.score}/5 stars for this trade.
          </p>
        )}

        {error && <p className="text-sm text-red-500 text-left">{error}</p>}

        <div className="space-y-3 pt-2">
          {existingRating ? (
            <PrimaryButton onClick={() => navigate(returnTo, { replace: true })}>
              Back to Chat
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton disabled={rating === 0 || submitting} onClick={handleSubmit}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </PrimaryButton>
              <button
                onClick={() => navigate(returnTo, { replace: true })}
                className="text-sm text-gray-500 font-medium"
              >
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
