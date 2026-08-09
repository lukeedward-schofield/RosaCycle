import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MessageCircle, MoreVertical } from 'lucide-react';
import Header from '@/shared/components/layout/Header';
import MaterialTag from '@/shared/components/common/MaterialTag';
import StatusPill from '@/shared/components/common/StatusPill';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import EcoImpactBox from '@/features/trades/components/trade/EcoImpactBox';
import TradeCompletionCard from '@/features/trades/components/trade/TradeCompletionCard';
import { useAuth } from '@/features/auth/AuthContext';
import { formatTradingFor, getTradeStatus } from '@/shared/utils/tradeFormat';
import {
  fetchTradeById,
  fetchOffersForTrade,
  acceptOffer,
  declineOffer,
  sendOffer,
  fetchUserRatings,
  deleteTrade,
  requestTradeCompletion,
  confirmTradeCompletion,
} from '@/shared/services/api';

export default function TradeDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  // TradesScreen links to My Trades items with ?owner=1 — derive isOwner from
  // that instead of a prop, since no route ever actually passed one in.
  const isOwner = searchParams.get('owner') === '1';

  const [trade, setTrade] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [decidingOfferId, setDecidingOfferId] = useState(null);
  const [posterRating, setPosterRating] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [completionBusy, setCompletionBusy] = useState(false);
  const [completionError, setCompletionError] = useState('');

  const handleBack = () => {
    navigate(isOwner ? '/trades?tab=mine' : '/trades');
  };

  const loadTrade = () => {
    setLoading(true);
    setNotFound(false);
    setError('');
    const requests = [fetchTradeById(id)];
    if (isOwner) requests.push(fetchOffersForTrade(id));

    Promise.all(requests)
      .then(([tradeData, offersData]) => {
        setTrade(tradeData);
        if (isOwner) setOffers(offersData || []);
      })
      .catch((err) => {
        if (err.message?.toLowerCase().includes('not found')) setNotFound(true);
        else setError(err.message || 'Could not load this trade.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isOwner]);

  useEffect(() => {
    if (!trade?.posterId) {
      setPosterRating(null);
      return undefined;
    }

    let cancelled = false;
    fetchUserRatings(trade.posterId)
      .then((result) => {
        if (cancelled) return;
        setPosterRating({
          average: result?.average ?? null,
          count: Array.isArray(result?.ratings) ? result.ratings.length : 0,
        });
      })
      .catch(() => {
        if (!cancelled) setPosterRating(null);
      });

    return () => {
      cancelled = true;
    };
  }, [trade?.posterId]);

  const handleDelete = async () => {
    try {
      await deleteTrade(trade.id);

      navigate("/trades?tab=mine");
    }catch(error){
      console.error("Failed to delete trade: ", error);
      setError(error.message || "Could not delete this trade");
    }
  };

  const handleDeleteClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trade?"
    );

    if(!confirmed) return;

    await handleDelete();
  };

  const handleClaim = async () => {
  if (claiming) return;

  setClaiming(true);
  setError('');

  try {
    await sendOffer(
      trade.id,
      {
        itemName: trade.name,
        category: trade.category,
        material: trade.material,
        weightKg: trade.weightKg,
        description: trade.description,
      },
      null
    );

    await loadTrade();
  } catch (err) {
    setError(err.message || 'Could not claim this item.');
  } finally {
    setClaiming(false);
  }
};


  const decide = async (offerId, action) => {
    if (decidingOfferId) return;
    setDecidingOfferId(offerId);
    setError('');
    try {
      if (action === 'accept') await acceptOffer(offerId);
      else await declineOffer(offerId);
      loadTrade();
    } catch (err) {
      setError(err.message || 'Could not update this offer.');
    } finally {
      setDecidingOfferId(null);
    }
  };

  const handleRequestCompletion = async () => {
    if (completionBusy) return;
    const confirmed = window.confirm(
      'Mark this trade as done? The other trader will have 3 days to confirm it.'
    );
    if (!confirmed) return;

    setCompletionBusy(true);
    setCompletionError('');
    try {
      const updated = await requestTradeCompletion(trade.id);
      setTrade(updated);
    } catch (err) {
      setCompletionError(err.message || 'Could not mark this trade as done.');
    } finally {
      setCompletionBusy(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (completionBusy) return;
    const confirmed = window.confirm(
      'Confirm that this trade has been completed?'
    );
    if (!confirmed) return;

    setCompletionBusy(true);
    setCompletionError('');
    try {
      const updated = await confirmTradeCompletion(trade.id);
      setTrade(updated);
    } catch (err) {
      setCompletionError(err.message || 'Could not confirm this trade.');
    } finally {
      setCompletionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-10">
        <Header onBack={handleBack} title="Items" />
        <p className="text-center text-sm text-gray-400 py-16">Loading...</p>
      </div>
    );
  }

  if (notFound || !trade) {
    return (
      <div className="pb-10">
        <Header onBack={handleBack} title="Items" />
        <p className="text-center text-sm text-gray-400 py-16">This trade could not be found.</p>
      </div>
    );
  }

  const itemInfo = (
    <>
      <div className="h-44 bg-gray-100 border-b border-gray-200">
        {trade.image && <img src={trade.image} alt={trade.name} className="w-full h-full object-cover" />}
        <div className="absolute top-3 right-3">
          <MaterialTag material={trade.material} />
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{trade.name}</h1>
            {isOwner && <StatusPill status={getTradeStatus(trade)} />}
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-x-1">
            <span>Posted by {trade.posterName}</span>
            {posterRating?.average != null && (
              <span
                className="inline-flex items-center gap-1"
                title={`${posterRating.count} rating${posterRating.count === 1 ? '' : 's'}`}
              >
                <span className="text-yellow-500" aria-hidden="true">★</span>
                <span className="font-medium text-gray-600">
                  {Number(posterRating.average).toFixed(1)}
                </span>
                <span className="text-gray-400">({posterRating.count})</span>
              </span>
            )}
            {trade.distanceKm != null && <span>• {trade.distanceKm}km</span>}
          </p>
          {trade.location && <p className="text-sm text-gray-500 mt-0.5">📍 {trade.location}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <span><span className="font-semibold">{trade.weightKg}kg</span> weight</span>
            <span><span className="font-semibold">{trade.quantity}</span> quantity</span>
          </div>
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowActions((prev) => !prev)}
                aria-label="Trade actions"
                className="p-1 -mr-1 text-gray-400 active:scale-95 transition-transform"
              >
                <MoreVertical size={20} />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 z-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                  <button
                    onClick={() => navigate(`/trades/${trade.id}/edit`)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit Trade
                  </button>

                  <button
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Delete Trade
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {trade.description && (
          <p className="text-sm text-gray-600 italic">&ldquo;{trade.description}&rdquo;</p>
        )}

        <EcoImpactBox weightKg={trade.weightKg} />

        <div>
          <p className="text-sm text-gray-400 mb-1">Trade for:</p>
          <p className="font-semibold text-gray-900">{formatTradingFor(trade.tradingFor)}</p>
        </div>

        <TradeCompletionCard
          trade={trade}
          currentUserId={user?.id}
          busy={completionBusy}
          error={completionError}
          onRequest={handleRequestCompletion}
          onConfirm={handleConfirmCompletion}
        />

        {/* Per docs: "user accepts offer > a chat is started" — for the owner,
            each accepted offer below already has its own "Open Chat" button,
            so this generic shortcut is just for the non-owner side. */}
        {trade.offerAccepted && !isOwner && (
          <button
            onClick={() => navigate(`/trades/${trade.id}/messages`)}
            className="flex items-center gap-2 text-brand-600 font-semibold text-sm"
          >
            <MessageCircle size={18} />
            Message
          </button>
        )}

        {!isOwner && (
          <div className="space-y-3 pt-2">
            {trade.tradingFor?.type === 'nothing' ? (
              trade.status !== 'open' ? (
                <p className="text-center text-sm text-gray-400 py-2">
                  This item is no longer available.
                </p>
              ) : (
                <PrimaryButton
                  onClick={handleClaim}
                  disabled={claiming}
                >
                  {claiming ? 'Claiming...' : 'Claim Item'}
                </PrimaryButton>
              )
            ) : trade.status !== 'open' ? (
              <p className="text-center text-sm text-gray-400 py-2">
                This trade is no longer accepting offers.
              </p>
            ) : (
              <PrimaryButton
                onClick={() =>
                  navigate('/trades/scan', {
                    state: {
                      context: 'bidding',
                      tradeId: trade.id
                    }
                  })
                }
              >
                Create Offer
              </PrimaryButton>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Non-owner: no Received Offers section, so the page just scrolls normally.
  if (!isOwner) {
    return (
      <div className="pb-10">
        <Header onBack={handleBack} title="Items" />
        <div className="relative">{itemInfo}</div>
      </div>
    );
  }

  // Owner: item info stays fixed in place; only Received Offers scrolls.
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onBack={handleBack} title="Items" />
      <div className="shrink-0 relative">{itemInfo}</div>

      <div className="flex-1 overflow-y-auto min-h-0 border-t border-gray-100 px-5 py-5">
        <h2 className="font-bold text-gray-900 mb-3">Received Offers</h2>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        {offers.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No offers received yet.</p>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{offer.offererName}</p>
                    <p className="text-xs text-gray-400">{new Date(offer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusPill status={offer.status} />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
                    {offer.image && (
                      <img src={offer.image} alt={offer.itemName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{offer.itemName}</p>
                    <p className="text-xs text-gray-500">{offer.weightKg}kg</p>
                  </div>
                  <MaterialTag material={offer.material} />
                </div>

                {offer.status === 'pending' && (
                  <div className="space-y-2 pt-1">
                    <PrimaryButton
                      onClick={() => decide(offer.id, 'accept')}
                      disabled={decidingOfferId === offer.id}
                    >
                      {decidingOfferId === offer.id ? 'Accepting...' : 'Accept Offer'}
                    </PrimaryButton>
                    <button
                      onClick={() => decide(offer.id, 'decline')}
                      disabled={decidingOfferId === offer.id}
                      className="w-full text-center text-sm text-gray-500 font-medium disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <PrimaryButton onClick={() => navigate(`/trades/${trade.id}/messages`)}>
                    <span className="flex items-center justify-center gap-2">
                      <MessageCircle size={18} />
                      Open Chat
                    </span>
                  </PrimaryButton>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
