import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MessageCircle, MoreVertical } from 'lucide-react';
import Header from '../components/layout/Header';
import MaterialTag from '../components/common/MaterialTag';
import StatusPill from '../components/common/StatusPill';
import PrimaryButton from '../components/common/PrimaryButton';
import EcoImpactBox from '../components/trade/EcoImpactBox';
import { formatTradingFor, getTradeStatus } from '../utils/tradeFormat';
import { fetchTradeById, fetchOffersForTrade, acceptOffer, declineOffer } from '../services/api';

export default function TradeDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Items" />
        <p className="text-center text-sm text-gray-400 py-16">Loading...</p>
      </div>
    );
  }

  if (notFound || !trade) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Items" />
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
          <p className="text-sm text-gray-500 mt-1">
            Posted by {trade.posterName}
            {trade.distanceKm != null && ` • ${trade.distanceKm}km`}
          </p>
          {trade.location && <p className="text-sm text-gray-500 mt-0.5">📍 {trade.location}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <span><span className="font-semibold">{trade.weightKg}kg</span> weight</span>
            <span><span className="font-semibold">{trade.quantity}</span> quantity</span>
          </div>
          {isOwner && (
            <button
              onClick={() => navigate(`/trades/${trade.id}/edit`)}
              aria-label="Edit Listing"
              className="p-1 -mr-1 text-gray-400 active:scale-95 transition-transform"
            >
              <MoreVertical size={20} />
            </button>
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
              // Free item — nothing to negotiate, so skip the offer flow entirely
              // and go straight to messaging the poster to arrange pickup.
              <PrimaryButton onClick={() => navigate(`/trades/${trade.id}/messages`)}>Message</PrimaryButton>
            ) : trade.status !== 'open' ? (
              <p className="text-center text-sm text-gray-400 py-2">
                This trade is no longer accepting offers.
              </p>
            ) : (
              <PrimaryButton
                onClick={() => navigate('/trades/scan', { state: { context: 'bidding', tradeId: trade.id } })}
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
        <Header onBack={() => navigate(-1)} title="Items" />
        <div className="relative">{itemInfo}</div>
      </div>
    );
  }

  // Owner: item info stays fixed in place; only Received Offers scrolls.
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onBack={() => navigate(-1)} title="Items" />
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
