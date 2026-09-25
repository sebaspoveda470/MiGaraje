import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  /** When provided, the stars become buttons for picking a rating */
  onChange?: (value: number) => void;
}

const SIZES = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-7 h-7' };
const LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

export const StarRating: React.FC<StarRatingProps> = ({ value, size = 'md', onChange }) => {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        const icon = <Star className={`${SIZES[size]} ${filled ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />;
        return onChange ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === rounded}
            aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'} (${LABELS[star]})`}
            onClick={() => onChange(star)}
            className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        );
      })}
      {onChange && rounded > 0 && <span className="ml-2 text-xs font-bold text-slate-600">{LABELS[rounded]}</span>}
    </div>
  );
};
