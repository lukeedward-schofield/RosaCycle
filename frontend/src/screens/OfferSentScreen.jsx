import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmationScreen from '../components/common/ConfirmationScreen';
import StatusPill from '../components/common/StatusPill';
import EcoImpactBox from '../components/trade/EcoImpactBox';
import { fetchTradeById } from '../services/api';

export default function OfferSentScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const offer = location.state?.offer;
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    fetchTradeById(id).then(setTrade).catch(() => setTrade(null));
  }, [id]);

  return (
    <ConfirmationScreen
      heading="Offer Sent!"
      subtext={`${trade?.posterName || 'The poster'} will be notified about your offer. You'll get an update here once they respond.`}
      summaryCard={
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Your Offer</p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
              {offer?.image && (
                <img src={offer.image} alt={offer.itemName} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{offer?.itemName || offer?.material || 'Your item'}</p>
              {offer?.weightKg && <p className="text-sm text-gray-500 mt-0.5">{offer.weightKg}kg weight</p>}
            </div>
          </div>
          {offer?.description && (
            <p className="text-sm text-gray-500 italic mt-3">&ldquo;{offer.description}&rdquo;</p>
          )}
          {offer?.weightKg && (
            <div className="mt-3">
              <EcoImpactBox weightKg={Number(offer.weightKg)} />
            </div>
          )}
          <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Status</span>
            <StatusPill status="Pending" />
          </div>
        </div>
      }
      primaryAction={{
        label: 'View Offer History',
        onClick: () => navigate('/trades?tab=offers'),
      }}
      secondaryAction={{
        label: 'Back to Browse',
        onClick: () => navigate('/trades?tab=browse'),
      }}
    />
  );
}
