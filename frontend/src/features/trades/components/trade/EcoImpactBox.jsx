import { Leaf } from 'lucide-react';

export default function EcoImpactBox({ weightKg }) {
  if (!weightKg) return null;
  // The message always mirrors the item's own weight exactly — no estimate
  // or multiplier — and simply doesn't render at all when there's no weight.
  const pollutionKg = Number(weightKg);

  return (
    <div className="flex items-start gap-3 bg-green-200 rounded-2xl p-4">
      <div className="shrink-0 w-11 h-11 rounded-full bg-green-100 flex items-center justify-center relative">
        <Leaf size={22} className="absolute text-green-300 rotate-[20deg] translate-x-1" />
        <Leaf size={19} className="relative text-green-600 -translate-x-0.5 translate-y-0.5" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">Eco-Impact</p>
        <p className="text-sm text-gray-800 mt-0.5">
          Trading this material prevents ~{pollutionKg}kg of pollution from new production.
        </p>
      </div>
    </div>
  );
}
