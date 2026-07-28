import MaterialTag from '../common/MaterialTag';
import StatusPill from '../common/StatusPill';
import { getTradeStatus } from '../../data/mockTrades';

/**
 * Two visual variants:
 * - "browse" (default): used in the Browse tab list — shows distance + poster name
 * - "track": used in the My Trades tab — minimal glance info only
 *   (name, material, weight, status); full detail (quantity, description,
 *   trading-for) lives in TradeDetailScreen behind "View Details".
 */
export default function TradeCard({ trade, variant = 'browse', onClick }) {
  const { image, name, material, distanceKm, posterName, weightKg } = trade;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200"
    >
      <div className="relative aspect-[4/3] bg-gray-100 border-b border-gray-200">
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        {material && (
          <div className="absolute top-3 right-3">
            <MaterialTag material={material} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900">{name}</h3>
          {weightKg != null && (
            <span className="font-semibold text-gray-900 shrink-0">{weightKg}kg</span>
          )}
        </div>

        {variant === 'browse' ? (
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500">
              {distanceKm != null && `${distanceKm}km`}
              {distanceKm != null && posterName && ' • '}
              {posterName}
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <StatusPill status={getTradeStatus(trade)} />
          </div>
        )}
      </div>
    </button>
  );
}
