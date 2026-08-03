import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationScreen from '@/shared/components/common/ConfirmationScreen';
import EcoImpactBox from '@/features/trades/components/trade/EcoImpactBox';

const TRADING_FOR_LABELS = {
  specific: (tf) => tf.value || 'a specific item',
  nothing: () => 'Nothing (free item)',
  negotiating: () => 'Open for negotiating',
};

export default function TradeCreatedScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const trade = location.state?.trade;

  return (
    <ConfirmationScreen
      heading="Trade Created!"
      subtext="Your item is now live. Interested traders can view your item picture, details, and send you an offer."
      summaryCard={
        trade && (
          <div>
            <p className="font-bold text-gray-900">{trade.name || trade.material}</p>
            <p className="text-sm text-gray-500 mt-1">{trade.weightKg}kg • {trade.category}</p>
            <p className="text-sm text-gray-500 mt-1">
              Trade for:{' '}
              {(TRADING_FOR_LABELS[trade.tradingFor?.type] || TRADING_FOR_LABELS.negotiating)(trade.tradingFor || {})}
            </p>
            {trade.description && (
              <p className="text-sm text-gray-500 italic mt-2">&ldquo;{trade.description}&rdquo;</p>
            )}
            <div className="mt-3">
              <EcoImpactBox weightKg={Number(trade.weightKg)} />
            </div>
          </div>
        )
      }
      primaryAction={{
        label: 'View in My Trades',
        onClick: () => navigate('/trades?tab=mine'),
      }}
      secondaryAction={{
        label: 'Back to Browse',
        onClick: () => navigate('/trades?tab=browse'),
      }}
    />
  );
}
