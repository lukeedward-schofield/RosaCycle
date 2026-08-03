import { Check } from 'lucide-react';
import Header from '@/shared/components/layout/Header';
import PrimaryButton from '@/shared/components/common/PrimaryButton';

/**
 * Shared layout used by: Trade Created, Offer Sent (and could be reused
 * for other "success" moments later, e.g. a future report-submitted screen).
 *
 * summaryCard: optional ReactNode rendered inside a bordered card
 * primaryAction: { label, onClick }
 * secondaryAction: { label, onClick }
 */
export default function ConfirmationScreen({
  heading,
  subtext,
  summaryCard,
  primaryAction,
  secondaryAction,
}) {
  return (
    <div className="pb-28">
      <Header showBell={false} />
      <div className="px-5 pt-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center">
            <Check size={28} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h1>
        {subtext && <p className="text-sm text-gray-500 max-w-xs">{subtext}</p>}

        {summaryCard && (
          <div className="w-full mt-8 border border-gray-200 rounded-2xl p-4 text-left">
            {summaryCard}
          </div>
        )}

        <div className="w-full mt-8 space-y-3">
          {primaryAction && (
            <PrimaryButton onClick={primaryAction.onClick}>{primaryAction.label}</PrimaryButton>
          )}
          {secondaryAction && (
            <button onClick={secondaryAction.onClick} className="text-sm text-gray-500 font-medium">
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
