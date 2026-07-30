import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import MaterialTag from '../components/common/MaterialTag';
import StatusPill from '../components/common/StatusPill';
import PrimaryButton from '../components/common/PrimaryButton';
import EcoImpactBox from '../components/trade/EcoImpactBox';
import { fetchTradeById, fetchMyOffers } from '../services/api';

/**
 * Read-only record of an offer you already sent — reached from Offer History.
 * Not the create-offer flow: you already offered, this just shows what and
 * lets you jump to the chat once it's been accepted.
 */
export default function ViewOfferScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTradeById(id).catch(() => null), fetchMyOffers()])
      .then(([tradeData, offers]) => {
        setTrade(tradeData);
        setOffer(offers.find((o) => o.tradeId === id) || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Your Offer" />
        <p className="text-center text-sm text-gray-400 py-16">Loading...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="pb-10">
        <Header onBack={() => navigate(-1)} title="Your Offer" />
        <p className="text-center text-sm text-gray-400 py-16">Offer not found.</p>
      </div>
    );
  }

  const accepted = offer.status === 'accepted';

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Your Offer" />

      <div className="p-5 space-y-5">
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Offer on</p>
          <p className="font-bold text-gray-900">{offer.tradeName}</p>
          {trade?.posterName && <p className="text-sm text-gray-500 mt-0.5">Posted by {trade.posterName}</p>}
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-400 font-semibold uppercase mb-3">You offered</p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
              {offer.image && (
                <img src={offer.image} alt={offer.itemName} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 truncate">{offer.itemName}</p>
              <div className="flex items-center gap-2 mt-1">
                {offer.weightKg && <span className="text-sm text-gray-500">{offer.weightKg}kg</span>}
                {offer.material && <MaterialTag material={offer.material} />}
              </div>
            </div>
          </div>
          {offer.description && (
            <p className="text-sm text-gray-500 italic mt-3">&ldquo;{offer.description}&rdquo;</p>
          )}
          {offer.weightKg && (
            <div className="mt-3">
              <EcoImpactBox weightKg={Number(offer.weightKg)} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
          <span className="text-sm text-gray-400">Status</span>
          <StatusPill status={offer.status} />
        </div>

        {accepted ? (
          <PrimaryButton onClick={() => navigate(`/trades/${offer.tradeId}/messages`)}>
            <span className="flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              Open Chat
            </span>
          </PrimaryButton>
        ) : (
          <p className="text-center text-sm text-gray-400">
            Waiting for {trade?.posterName || 'the poster'} to respond.
          </p>
        )}
      </div>
    </div>
  );
}
