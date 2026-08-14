import { useMemo } from 'react';
import { GRID_RANKS, classNotation, ALL_CLASSES } from '../engine/handClass';

// The 13x13 hand grid every range chart is drawn on: pairs down the diagonal,
// suited above it, offsuit below.
//
// Showing your hand's position inside the whole range is what builds preflop
// intuition. A verdict on one hand teaches one hand; seeing that it sits just
// inside the boundary — and what sits just outside — teaches the boundary.

export default function RangeGrid({
  range,
  highlight,
  title,
  subtitle,
  colorFor,
  compact = false,
}) {
  const cells = useMemo(() => ALL_CLASSES.map(index => ({
    index,
    notation: classNotation(index),
    weight: weightOf(range, index),
  })), [range]);

  const cellSize = compact ? 'text-[7px]' : 'text-[8px] sm:text-[9px]';

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-2">
          {title && <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</h4>}
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      )}

      <div
        className="grid gap-px bg-surface-900/60 p-px rounded-lg overflow-hidden"
        style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
        role="img"
        aria-label={title || 'Hand range grid'}
      >
        {cells.map(({ index, notation, weight }) => {
          const isHighlighted = notation === highlight;
          const background = colorFor
            ? colorFor(index, weight)
            : defaultColor(weight);

          return (
            <div
              key={index}
              title={`${notation}${weight > 0 ? ` — ${Math.round(weight * 100)}%` : ''}`}
              className={`
                relative aspect-square flex items-center justify-center
                ${cellSize} font-semibold leading-none select-none
                ${weight > 0 ? 'text-white/90' : 'text-gray-600'}
                ${isHighlighted ? 'ring-2 ring-gold z-10 rounded-[2px]' : ''}
              `}
              style={{ backgroundColor: background }}
            >
              {notation}
            </div>
          );
        })}
      </div>

      {/* Axis hint. Without it the diagonal split is a mystery on first sight. */}
      <p className="mt-1.5 text-[10px] text-gray-600 text-center">
        Pairs on the diagonal · suited above · offsuit below
      </p>
    </div>
  );
}

function weightOf(range, index) {
  if (!range) return 0;
  if (range instanceof Map) return range.get(index) ?? 0;
  if (Array.isArray(range)) return range.includes(index) ? 1 : 0;
  return range[index] ?? 0;
}

function defaultColor(weight) {
  if (weight <= 0) return 'rgba(255,255,255,0.03)';
  // A single hue at varying strength rather than a rainbow: the grid is read at
  // a glance, and "more colour means more often" needs no legend.
  return `rgba(59, 130, 246, ${0.2 + weight * 0.65})`;
}

export { GRID_RANKS };
