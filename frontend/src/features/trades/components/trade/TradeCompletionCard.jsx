import { CheckCircle2, Clock3 } from 'lucide-react';
import PrimaryButton from '@/shared/components/common/PrimaryButton';

function formatDeadline(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function TradeCompletionCard({
  trade,
  currentUserId,
  busy = false,
  error = '',
  onRequest,
  onConfirm,
}) {
  if (!trade?.offerAccepted || !currentUserId) return null;

  const isOwner = currentUserId === trade.posterId;
  const isAcceptedOfferer = currentUserId === trade.acceptedOffererId;
  if (!isOwner && !isAcceptedOfferer) return null;

  const completed = trade.status === 'completed';
  const requestedAt = trade.completion?.requestedAt;
  const autoCompleteAt = trade.completion?.autoCompleteAt;
  const deadline = formatDeadline(autoCompleteAt);

  if (completed) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Trade completed</p>
            <p className="text-xs text-green-700 mt-0.5">
              Both parties can now leave a rating for this trade.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isOwner && !requestedAt) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Finished the exchange?</p>
          <p className="text-xs text-gray-500 mt-1">
            Mark the trade as done. {trade.acceptedOffererName || 'The other trader'} will be asked to confirm it.
          </p>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <PrimaryButton onClick={onRequest} disabled={busy}>
          {busy ? 'Marking as Done...' : 'Mark Trade as Done'}
        </PrimaryButton>
      </div>
    );
  }

  if (isOwner && requestedAt) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Clock3 size={20} className="text-yellow-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">Waiting for confirmation</p>
            <p className="text-xs text-yellow-800 mt-0.5">
              {trade.acceptedOffererName || 'The other trader'} can confirm that the trade is complete.
              {deadline ? ` If there is no response, it will auto-complete after ${deadline}.` : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAcceptedOfferer && requestedAt) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-brand-800">Did you complete this trade?</p>
          <p className="text-xs text-gray-600 mt-1">
            {trade.posterName} marked the trade as done. Confirm once the exchange has actually been completed.
            {deadline ? ` It will auto-complete after ${deadline} if you do not respond.` : ''}
          </p>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <PrimaryButton onClick={onConfirm} disabled={busy}>
          {busy ? 'Confirming...' : 'Confirm Trade Complete'}
        </PrimaryButton>
      </div>
    );
  }

  return null;
}
