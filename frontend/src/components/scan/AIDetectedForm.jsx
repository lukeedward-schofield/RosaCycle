/**
 * Editable form shown after AI scans a photo.
 *
 * context="posting" -> shows Caption + Location + Desired pickup location +
 *                       Trade-for fields (docs: "User details" step under
 *                       Posting a Trade). Caption is a listing description,
 *                       so it only applies here — you're creating a new
 *                       public listing.
 * context="bidding"  -> just the AI-detected item fields above (Category,
 *                       Material, weight, Item name) — no caption, no
 *                       location, no message field. This is an offer on
 *                       someone else's existing trade; the trade owner
 *                       reviews the item itself, nothing else to fill in.
 *
 * All AI-generated values are pre-filled but editable, per docs:
 * "AI scans the photo and outputs the required item details" -> "User can edit details"
 */
export default function AIDetectedForm({ context = 'posting', values, onChange }) {
  const set = (key) => (e) => onChange?.({ ...values, [key]: e.target.value });

  const inputClass =
    'w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500';
  const labelClass = 'text-xs font-semibold text-gray-500 mb-1.5 block';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          AI-Detected (editable)
        </p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Category</label>
            <input className={inputClass} value={values.category || ''} onChange={set('category')} placeholder="e.g. Metal" />
          </div>
          <div>
            <label className={labelClass}>Material</label>
            <input className={inputClass} value={values.material || ''} onChange={set('material')} placeholder="e.g. Steel scrap" />
          </div>
          <div>
            <label className={labelClass}>Estimated weight (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={values.weightKg || ''}
              onChange={set('weightKg')}
              placeholder="e.g. 4.5"
            />
          </div>
          {values.confidence != null && (
            <p className="text-xs text-gray-400">AI confidence: {values.confidence}%</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Item name</label>
        <input className={inputClass} value={values.itemName || ''} onChange={set('itemName')} placeholder="e.g. Old Woods" />
      </div>

      {context === 'posting' && (
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              min="1"
              className={inputClass}
              value={values.quantity || ''}
              onChange={set('quantity')}
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className={labelClass}>Caption</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              value={values.description || ''}
              onChange={set('description')}
              placeholder="Describe the item's condition, e.g. &quot;Flattened boxes, dry and clean.&quot;"
            />
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</p>
          <div>
            <label className={labelClass}>Current location</label>
            <input
              className={inputClass}
              value={values.currentLocation || ''}
              onChange={set('currentLocation')}
              placeholder="Auto-filled from GPS"
            />
          </div>
          <div>
            <label className={labelClass}>Desired pickup location</label>
            <input
              className={inputClass}
              value={values.pickupLocation || ''}
              onChange={set('pickupLocation')}
              placeholder="Where should traders pick this up?"
            />
          </div>
          <div>
            <label className={labelClass}>Trade for</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { key: 'specific', label: 'Specific item' },
                { key: 'nothing', label: 'Nothing' },
                { key: 'negotiating', label: 'Negotiable' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChange?.({ ...values, tradingForType: opt.key })}
                  className={`py-2 rounded-lg text-xs font-medium ${
                    values.tradingForType === opt.key
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {values.tradingForType === 'specific' && (
              <input
                className={inputClass}
                value={values.tradingForValue || ''}
                onChange={set('tradingForValue')}
                placeholder="e.g. Paper or old magazines"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
