import { useState } from 'react';

const TRACK_1_PHRASES = [
  'ITEM BY ITEM AMBAGAN',
  'NO AWKWARD CHAT MATH',
  'EXACT CENTAVO ACCURACY',
  'COLLAPSE DEBT CHAINS',
  'TAGASALO APPROVED',
];

const TRACK_2_PHRASES = [
  'AUTO-COMPUTED SERVICE CHARGE',
  'NO SAMAAN NG LOOB',
  'INSTANT GCASH SETTLE',
  'VERIFIED RECEIVER PROOF',
  '100% AMBAGAN TRANSPARENCY',
];

/**
 * Dual-direction running kinetic typography marquee ribbons.
 * Delivers the high-density editorial concept across the viewport.
 */
export const KineticMarquee = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Quadruple phrases for gapless continuous scrolling
  const row1 = [...TRACK_1_PHRASES, ...TRACK_1_PHRASES, ...TRACK_1_PHRASES, ...TRACK_1_PHRASES];
  const row2 = [...TRACK_2_PHRASES, ...TRACK_2_PHRASES, ...TRACK_2_PHRASES, ...TRACK_2_PHRASES];

  return (
    <div
      className="kinetic-marquee-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-hidden="true"
    >
      {/* Ribbon 1: Solid Berry Gradient running Left */}
      <div className="marquee-ribbon ribbon-solid-berry">
        <div className={`marquee-track track-scroll-left ${isPaused ? 'paused' : ''}`}>
          {row1.map((phrase, idx) => (
            <span key={`r1-${idx}`} className="marquee-item">
              <span className="marquee-bullet">✦</span>
              <span className="marquee-text-bold">{phrase}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Ribbon 2: Frosted Glass Outline running Right */}
      <div className="marquee-ribbon ribbon-glass-outline liquid-glass-subtle">
        <div className={`marquee-track track-scroll-right ${isPaused ? 'paused' : ''}`}>
          {row2.map((phrase, idx) => (
            <span key={`r2-${idx}`} className="marquee-item">
              <span className="marquee-bullet-pink">●</span>
              <span className="marquee-text-outline">{phrase}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KineticMarquee;
