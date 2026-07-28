import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import FloatingActionButton from '../components/common/FloatingActionButton';
import TradeCard from '../components/cards/TradeCard';
import StatusPill from '../components/common/StatusPill';
import { mockTrackTrades, mockOfferHistory } from '../data/mockTrades';

export default function TrackPendingTradesScreen() {
  const navigate = useNavigate();
  const hasTrades = mockTrackTrades.length > 0;

  return (
    <div className="pb-24">
      <Header />
      <div className="px-4 pt-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Trades</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-[280px]">
              Manage your active contributions and review your ecological trade history.
            </p>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
            {mockTrackTrades.length} Active
          </span>
        </div>

        {hasTrades ? (
          <div className="space-y-4">
            {mockTrackTrades.map((trade) => (
              <div key={trade.id} className="space-y-2">
                <TradeCard trade={trade} variant="track" onClick={() => navigate(`/trade/${trade.id}?owner=1`)} />
                <button
                  onClick={() => navigate(`/trade/${trade.id}?owner=1`)}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-4">No active trades yet.</p>
            <button
              onClick={() => navigate('/report', { state: { context: 'posting' } })}
              className="text-brand-600 font-semibold text-sm"
            >
              Post your first item →
            </button>
          </div>
        )}

        {mockOfferHistory.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-3">Offer History</h2>
            <div className="space-y-2">
              {mockOfferHistory.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700">{offer.tradeName}</span>
                  <StatusPill status={offer.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FloatingActionButton
        label="Post a trade"
        onClick={() => navigate('/report', { state: { context: 'posting' } })}
      />
      <BottomNav />
    </div>
  );
}
