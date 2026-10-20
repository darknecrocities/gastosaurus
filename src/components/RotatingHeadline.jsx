import { useState, useEffect } from 'react';

const ROTATING_PHRASES = [
  'Samgyupsal Nights',
  'Boracay Roadtrips',
  'Condo Rent & Meralco',
  'Coffee & Milk Tea Runs',
  'Midnight Grab Orders',
];

/**
 * Kinetic typography headline with 3D word rotation.
 * Delivers the bold editorial concept requested by the user.
 */
export const RotatingHeadline = () => {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        setIsFlipping(false);
      }, 300);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rotating-headline-wrapper">
      <div className="editorial-meta-index">
        <span className="editorial-slash-badge">01 // THE AMBAGAN MANIFESTO</span>
        <span className="editorial-status-dot" />
      </div>

      <h1 className="editorial-hero-title">
        <span className="editorial-hero-line">STOP THE AWKWARD</span>
        <span className="editorial-hero-line text-stroke-hollow">CHAT MATH.</span>
        <span className="editorial-hero-line hero-split-line">
          <span>SPLIT FOR</span>
          <span className={`rotating-word-badge liquid-glass-subtle ${isFlipping ? 'flipping-out' : 'flipping-in'}`}>
            <span className="rotating-word-text text-gradient-shimmer">
              {ROTATING_PHRASES[index]}
            </span>
          </span>
        </span>
        <span className="editorial-hero-line">WITH ZERO DRAMA.</span>
      </h1>
    </div>
  );
};

export default RotatingHeadline;
