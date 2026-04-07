interface PlantVisualProps {
  state: 'growing' | 'wilting' | 'recovered';
  className?: string;
}

const palettes = {
  growing: {
    pot:      '#c2956a',
    potRim:   '#a87550',
    soil:     '#7a5230',
    stem:     '#4a8c3f',
    leaf1:    '#5db85b',
    leaf2:    '#3f9e3d',
    leaf3:    '#72c66f',
    leaf4:    '#4da84b',
    highlight:'rgba(255,255,255,0.18)',
  },
  wilting: {
    pot:      '#a89880',
    potRim:   '#8c7e6a',
    soil:     '#5e4d38',
    stem:     '#7a8c5e',
    leaf1:    '#8a9e70',
    leaf2:    '#7a8c5a',
    leaf3:    '#9aae80',
    leaf4:    '#858c6a',
    highlight:'rgba(255,255,255,0.08)',
  },
  recovered: {
    pot:      '#b8a882',
    potRim:   '#9a8c6a',
    soil:     '#6a5040',
    stem:     '#5a9e4a',
    leaf1:    '#78c870',
    leaf2:    '#5aae58',
    leaf3:    '#8ad880',
    leaf4:    '#68be66',
    highlight:'rgba(255,255,255,0.14)',
  },
};

export default function PlantVisual({ state, className = '' }: PlantVisualProps) {
  const c = palettes[state];
  const isWilting = state === 'wilting';

  return (
    <svg
      viewBox="0 0 160 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`Plant: ${state}`}
    >
      {/* Pot body */}
      <path d="M50 145 L55 185 Q80 192 105 185 L110 145 Z" fill={c.pot} />
      {/* Pot highlight */}
      <path d="M58 148 L62 178 Q80 184 88 178 L90 148 Z" fill={c.highlight} />
      {/* Pot rim */}
      <rect x="44" y="138" width="72" height="12" rx="6" fill={c.potRim} />
      {/* Soil */}
      <ellipse cx="80" cy="138" rx="33" ry="7" fill={c.soil} />

      {/* Stem */}
      {isWilting ? (
        <path
          d="M80 138 Q84 115 78 95 Q75 80 72 68"
          stroke={c.stem} strokeWidth="5" strokeLinecap="round" fill="none"
        />
      ) : (
        <path
          d="M80 138 Q82 115 80 90 Q79 72 80 55"
          stroke={c.stem} strokeWidth="5" strokeLinecap="round" fill="none"
        />
      )}

      {/* Leaves */}
      {isWilting ? (
        <>
          <path d="M78 110 Q50 118 42 130 Q55 125 78 115 Z" fill={c.leaf1} />
          <path d="M76 100 Q105 110 115 122 Q102 116 76 106 Z" fill={c.leaf2} />
          <path d="M72 82 Q55 72 48 60 Q62 72 74 80 Z" fill={c.leaf3} />
          <path d="M73 92 Q92 84 100 75 Q88 85 73 96 Z" fill={c.leaf4} />
        </>
      ) : (
        <>
          <path d="M80 105 Q55 90 40 72 Q58 86 80 100 Z" fill={c.leaf1} />
          <path d="M80 95 Q108 80 122 62 Q105 78 80 90 Z" fill={c.leaf2} />
          <path d="M80 72 Q60 55 48 38 Q65 56 80 68 Z" fill={c.leaf3} />
          <path d="M80 65 Q102 48 115 30 Q100 50 80 60 Z" fill={c.leaf4} />
          <ellipse cx="80" cy="48" rx="8" ry="10" fill={c.leaf2} />
          <ellipse cx="77" cy="45" rx="3" ry="4" fill={c.highlight} />
        </>
      )}

      {/* State indicator dot */}
      <circle
        cx="108" cy="175" r="5"
        fill={
          state === 'growing'  ? '#4ade80' :
          state === 'wilting'  ? '#f87171' :
                                 '#86efac'
        }
        opacity="0.9"
      />
    </svg>
  );
}
