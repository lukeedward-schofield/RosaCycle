import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, MessageCircle } from 'lucide-react';
import Header from '@/shared/components/layout/Header';
import BottomNav from '@/shared/components/layout/BottomNav';
import SearchBar from '@/shared/components/common/SearchBar';
import FloatingActionButton from '@/shared/components/common/FloatingActionButton';
import FilterChipRow from '@/features/trades/components/trade/FilterChipRow';
import TradeCard from '@/features/trades/components/cards/TradeCard';
import StatusPill from '@/shared/components/common/StatusPill';
import { fetchBrowseTrades, fetchMyTrades, fetchMyOffers } from '@/shared/services/api';

const SUB_TABS = [
  { key: 'browse', label: 'Browse' },
  { key: 'mine', label: 'My Trades' },
  { key: 'offers', label: 'Offer History' },
];

export default function TradesScreen() {
  const navigate = useNavigate();
  // Tab state lives in the URL (not local state) so the browser Back button
  // returns to the tab you were actually on, instead of always resetting to
  // Browse — switching tabs uses replace so it doesn't spam browser history.
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const subTab = rawTab === 'mine' || rawTab === 'offers' ? rawTab : 'browse';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Items');

  const [browseTrades, setBrowseTrades] = useState([]);
  const [myTrades, setMyTrades] = useState([]);
  const [offerHistory, setOfferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([fetchBrowseTrades(), fetchMyTrades(), fetchMyOffers()])
      .then(([browse, mine, offers]) => {
        if (cancelled) return;
        setBrowseTrades(browse);
        setMyTrades(mine);
        setOfferHistory(offers);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load trades.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSubTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const goToCreateTrade = () => navigate('/trades/scan', { state: { context: 'posting' } });

  const filteredBrowse = browseTrades.filter((t) => {
    const matchesFilter = filter === 'All Items' || t.material === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pb-40">
      <Header />

      {/* Segmented tabs: Browse (all available trades), My Trades (own posts), Offer History (offers you sent) */}
      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {SUB_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                subTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-center text-sm text-gray-400 py-10">Loading...</p>}
      {!loading && error && <p className="text-center text-sm text-red-500 py-10">{error}</p>}

      {!loading && !error && subTab === 'browse' && (
        <div className="px-4 pt-4 space-y-4">
          <SearchBar value={search} onChange={setSearch} />
          <FilterChipRow active={filter} onSelect={setFilter} />

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{filteredBrowse.length} items nearby</span>
            <button className="text-gray-500 font-medium">Sort: Nearest ▾</button>
          </div>

          <div className="space-y-4">
            {filteredBrowse.map((trade) => (
              <TradeCard key={trade.id} trade={trade} onClick={() => navigate(`/trades/${trade.id}`)} />
            ))}
            {filteredBrowse.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">No items match your search.</p>
            )}
          </div>
        </div>
      )}

      {!loading && !error && subTab === 'mine' && (
        <div className="px-4 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Trades</h1>
              <p className="text-sm text-gray-500 mt-1 max-w-[280px]">
                Manage your active contributions and review your ecological trade history.
              </p>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
              {myTrades.length} Active
            </span>
          </div>

          {myTrades.length > 0 ? (
            <div className="space-y-4">
              {myTrades.map((trade) => (
                <div key={trade.id} className="space-y-2">
                  <TradeCard trade={trade} variant="track" onClick={() => navigate(`/trades/${trade.id}?owner=1`)} />
                  <button
                    onClick={() => navigate(`/trades/${trade.id}?owner=1`)}
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
              <button onClick={goToCreateTrade} className="text-brand-600 font-semibold text-sm">
                Post your first item →
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && !error && subTab === 'offers' && (
        <div className="px-4 pt-4 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Offer History</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tap an offer to view what you sent.{' '}
              {offerHistory.some((o) => o.status === 'accepted') && 'Accepted offers open the chat.'}
            </p>
          </div>

          {offerHistory.length > 0 ? (
            <div className="space-y-2">
              {offerHistory.map((offer) => {
                const accepted = offer.status === 'accepted';
                return (
                  <button
                    key={offer.id}
                    onClick={() => navigate(`/trades/${offer.tradeId}/my-offer`)}
                    className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 active:scale-[0.98] transition-transform"
                  >
                    <span className="text-sm font-medium text-gray-700">{offer.tradeName}</span>
                    <span className="flex items-center gap-2">
                      {accepted ? (
                        <>
                          <span className="text-xs font-semibold text-brand-600">Accepted</span>
                          <MessageCircle size={16} className="text-brand-600" />
                        </>
                      ) : (
                        <>
                          <StatusPill status={offer.status} />
                          <ChevronRight size={16} className="text-gray-300" />
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-10">You haven&apos;t sent any offers yet.</p>
          )}
        </div>
      )}

      <FloatingActionButton label="Post a trade" onClick={goToCreateTrade} />
      <BottomNav />
    </div>
  );
}
