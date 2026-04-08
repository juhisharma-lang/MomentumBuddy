import plant1 from '@/assets/plants/plant-1-seedling.png';
import plant2 from '@/assets/plants/plant-2-young.png';
import plant3 from '@/assets/plants/plant-3-midgrowth.png';
import plant4 from '@/assets/plants/plant-4-blooming.png';
import plant5 from '@/assets/plants/plant-5-peak.png';
import plant6 from '@/assets/plants/plant-6-starting-wilt.png';
import plant7 from '@/assets/plants/plant-7-wilting.png';
import plant8 from '@/assets/plants/plant-8-fully-wilted.png';

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
    if (missStreak >= 5) return plant8;
    if (missStreak >= 2) return plant7;
    return plant6;
  }
  if (state === 'recovered') return plant3;
  // growing — advance based on session streak
  if (sessionStreak >= 15) return plant5;
  if (sessionStreak >= 10) return plant4;
  if (sessionStreak >= 5)  return plant3;
  if (sessionStreak >= 2)  return plant2;
  return plant1;
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
    />
  );
}