import { useState, useRef, useCallback } from 'react';
import mascotImg from '../assets/mascot.png';
import { sounds } from '../lib/sounds';
import { MessageCircle, Sparkles } from './CustomIcons';

const CHOMP_STORAGE_KEY = 'gastosaurus_chomps_count';

const QUIPS = [
  '100% computed, 0% sama ng loob.',
  'Walang tatakas sa ambagan!',
  'Sino umorder ng extra rice at Coke Float?!',
  'Huy, bayad muna bago mag-milk tea!',
  'Auto-balanced para walang tampuhan!',
  'Kaya mo yan! Bayaran mo na yung utang kay tropa.',
  'Walang takbuhan pagdating ng resibo!',
  'Bawat sentimo, kwentado. Walang short, walang over!',
];

/**
 * Clucky-inspired interactive Gastosaurus mascot.
 * Features 3D cursor tilt tracking, physics squash/stretch, cute dinosaur audio,
 * and speech cloud overlay positioned precisely over the dinosaur's mouth.
 */
export const InteractiveMascot = ({ className = '', showPrompt = true }) => {
  const [chomps, setChomps] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(CHOMP_STORAGE_KEY) : null;
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [quipIndex, setQuipIndex] = useState(0);
  const [isChomping, setIsChomping] = useState(false);
  const [showQuip, setShowQuip] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const quipTimer = useRef(null);

  const handlePointerMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({
      x: Math.max(-12, Math.min(12, y * -10)),
      y: Math.max(-12, Math.min(12, x * 10)),
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleChomp = () => {
    const nextCount = chomps + 1;
    sounds.playCuteDino(nextCount);
    setChomps(nextCount);
    try {
      localStorage.setItem(CHOMP_STORAGE_KEY, String(nextCount));
    } catch {
      /* ignore */
    }

    // Trigger squish bounce animation
    setIsChomping(true);
    setTimeout(() => setIsChomping(false), 350);

    // Advance barkada quip
    setQuipIndex((prev) => (showQuip ? (prev + 1) % QUIPS.length : prev));
    setShowQuip(true);
    clearTimeout(quipTimer.current);
    quipTimer.current = setTimeout(() => setShowQuip(false), 5000);
  };

  return (
    <div
      ref={containerRef}
      className={`interactive-mascot-container ${className}`}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {/* Mascot Interactive Action Button with 3D Tilt */}
      <button
        type="button"
        className={`mascot-interactive-btn ${isChomping ? 'animate-chomp' : 'animate-float'}`}
        onClick={handleChomp}
        aria-label="Make Gastosaurus chomp"
        style={{
          transform: isChomping
            ? undefined
            : `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isChomping ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {/* Quip Speech Bubble Overlay - Positioned Directly Over Dino's Mouth */}
        {showQuip && (
          <div className="mascot-speech-bubble animate-pop" role="tooltip">
            <MessageCircle size={16} className="speech-icon" strokeWidth={2.2} />
            <span className="speech-text">{QUIPS[quipIndex]}</span>
            <div className="speech-arrow" aria-hidden="true" />
          </div>
        )}

        <div className="mascot-badge-circle liquid-glass-card">
          <img
            src={mascotImg}
            alt="Gastosaurus mascot"
            className="hero-mascot-img"
            draggable={false}
          />
        </div>

        {/* Playful 'Tap me!' Hint */}
        {showPrompt && !showQuip && chomps === 0 && (
          <div className="mascot-click-hint liquid-glass-subtle animate-pop">
            <Sparkles size={12} className="sparkle-accent" />
            <span>Tap me!</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default InteractiveMascot;
