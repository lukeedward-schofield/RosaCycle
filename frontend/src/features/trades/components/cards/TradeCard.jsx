import MaterialTag from '@/shared/components/common/MaterialTag';
import StatusPill from '@/shared/components/common/StatusPill';
import { getTradeStatus } from '@/shared/utils/tradeFormat';

/**
 * Two visual variants:
 * - "browse" (default): used in the Browse tab list — shows distance + poster name
 * - "track": used in the My Trades tab — minimal glance info only
 *   (name, material, weight, status); full detail (quantity, description,
 *   trading-for) lives in TradeDetailScreen behind "View Details".
 */
export default function TradeCard({ trade, variant = 'browse', onClick, ratingSummary }) {
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
            <div className="flex items-center gap-1 text-sm text-gray-500">
              {distanceKm != null && <span>{distanceKm}km</span>}
              {distanceKm != null && posterName && <span>•</span>}
              {posterName && <span>{posterName}</span>}
              {posterName && ratingSummary?.average != null && (
                <span className="inline-flex items-center gap-1 ml-1" title={`${ratingSummary.count} rating${ratingSummary.count === 1 ? '' : 's'}`}>
                  <span className="text-yellow-500" aria-hidden="true">★</span>
                  <span className="font-medium text-gray-600">
                    {Number(ratingSummary.average).toFixed(1)}
                  </span>
                  <span className="text-gray-400">({ratingSummary.count})</span>
                </span>
              )}
            </div>
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
