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

// Derives a trade's lifecycle status: Pending (open, whether or not it has an
// offer yet awaiting your decision) -> Accepted (offer accepted, chat unlocked).
export function getTradeStatus(trade) {
  return trade.offerAccepted ? 'Accepted' : 'Pending';
}
