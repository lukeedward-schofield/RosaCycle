// Human-readable label for the tradingFor field per doc spec (x / nothing / open for negotiating)
export function formatTradingFor(tradingFor) {
  if (!tradingFor) return 'Open to offers';
  switch (tradingFor.type) {
    case 'specific':
      return tradingFor.value;
    case 'nothing':
      return 'Nothing (free item)';
    case 'negotiating':
      return 'Open for negotiating';
    default:
      return 'Open to offers';
  }
}

export function getTradeStatus(trade) {
  if (trade?.status === 'completed') return 'Completed';
  if (trade?.completion?.requestedAt) return 'Awaiting confirmation';
  if (trade?.offerAccepted) return 'In progress';
  return 'Pending';
}
