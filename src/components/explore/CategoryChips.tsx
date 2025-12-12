// src/components/explore/CategoryChips.tsx

import React from 'react';
import { motion } from 'framer-motion';

export type CategoryKey =
  | 'All Tools'
  | 'Breathing'
  | 'Grounding'
  | 'Reflection'
  | 'Urge Management'
  | 'Somatic'
  | 'Emergency'
  | 'Emotional'
  | 'Sleep';

interface CategoryChipsProps {
  categories: CategoryKey[];
  selected: CategoryKey;
  onSelect: (cat: CategoryKey) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selected,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = cat === selected;

        return (
          <motion.button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={[
              'relative px-4 py-1.5 text-xs md:text-sm rounded-full border',
              'transition-colors duration-200',
              isActive
                ? 'border-amber-300/80 bg-amber-300/15 text-amber-100'
                : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10',
            ].join(' ')}
            whileTap={{ scale: 0.95 }}
          >
            {isActive && (
              <motion.span
                layoutId="category-glow"
                className="absolute inset-0 rounded-full bg-amber-200/15"
                style={{ filter: 'blur(8px)' }}
                transition={{ type: 'spring', stiffness: 140, damping: 22 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
