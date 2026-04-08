const PLANTS = {
  1: '/plants/plant-1-seedling.png',
  2: '/plants/plant-2-young.png',
  3: '/plants/plant-3-midgrowth.png',
  4: '/plants/plant-4-blooming.png',
  5: '/plants/plant-5-peak.png',
  6: '/plants/plant-6-starting-wilt.png',
  7: '/plants/plant-7-wilting.png',
  8: '/plants/plant-8-fully-wilted.png',
} as const;

interface PlantVisualProps {
  state: 'growing' | 'wilting' | 'recovered';
  missStreak?: number;
  sessionStreak?: number;
  className?: string;
}

function getPlantImage(
  state: 'growing' | 'wilting' | 'recovered',
  missStreak: number,
  sessionStreak: number
): string {
  if (state === 'wilting') {
    if (missStreak >= 5) return PLANTS[8];
    if (missStreak >= 2) return PLANTS[7];
    return PLANTS[6];
  }
  if (state === 'recovered') return PLANTS[3];
  // growing — advance based on session streak
  if (sessionStreak >= 15) return PLANTS[5];
  if (sessionStreak >= 10) return PLANTS[4];
  if (sessionStreak >= 5)  return PLANTS[3];
  if (sessionStreak >= 2)  return PLANTS[2];
  return PLANTS[1];
}

function getAltText(
  state: 'growing' | 'wilting' | 'recovered',
  missStreak: number,
  sessionStreak: number
): string {
  if (state === 'wilting') {
    if (missStreak >= 5) return 'Plant fully wilted';
    if (missStreak >= 2) return 'Plant wilting';
    return 'Plant starting to wilt';
  }
  if (state === 'recovered') return 'Plant recovering';
  if (sessionStreak >= 15) return 'Plant at peak health';
  if (sessionStreak >= 10) return 'Plant blooming';
  if (sessionStreak >= 5)  return 'Plant mid-growth';
  if (sessionStreak >= 2)  return 'Young plant';
  return 'Seedling';
}

export default function PlantVisual({
  state,
  missStreak = 0,
  sessionStreak = 0,
  className = '',
}: PlantVisualProps) {
  const src = getPlantImage(state, missStreak, sessionStreak);
  const alt = getAltText(state, missStreak, sessionStreak);

  return (
  <img
    src={src}
    alt={alt}
    className={className}
    draggable={false}
    style={{ mixBlendMode: 'multiply' }}
  />
);
}