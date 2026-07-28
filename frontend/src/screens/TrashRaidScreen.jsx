import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import SearchBar from '../components/common/SearchBar';
import FloatingActionButton from '../components/common/FloatingActionButton';
import FilterChipRow from '../components/trade/FilterChipRow';
import TradeCard from '../components/cards/TradeCard';
import { mockTrades } from '../data/mockTrades';

export default function TrashRaidScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Items');

  const filtered = mockTrades.filter((t) => {
    const matchesFilter = filter === 'All Items' || t.material === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pb-24">
      <Header />
      <div className="px-4 pt-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} />
        <FilterChipRow active={filter} onSelect={setFilter} />

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{filtered.length} items nearby</span>
          <button className="text-gray-500 font-medium">Sort: Nearest ▾</button>
        </div>

        <div className="space-y-4">
          {filtered.map((trade) => (
            <TradeCard key={trade.id} trade={trade} onClick={() => navigate(`/trade/${trade.id}`)} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">No items match your search.</p>
          )}
        </div>
      </div>

      <FloatingActionButton
        label="Post a trade"
        onClick={() => navigate('/report', { state: { context: 'posting' } })}
      />
      <BottomNav />
    </div>
  );
}
