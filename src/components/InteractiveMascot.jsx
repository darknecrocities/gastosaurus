import { useState, useRef, useCallback } from 'react';
import mascotImg from '../assets/mascot.png';
import { sounds } from '../lib/sounds';
import { Sparkles, MessageCircle } from './CustomIcons';

const CHOMP_STORAGE_KEY = 'gastosaurus_chomps_count';

const QUIPS = [
  'Walang tatakas sa ambagan! 🦖',
  'Sino umorder ng extra rice at Coke Float?!',
  'Huy, bayad muna bago mag-milk tea!',
  '100% computed, 0% sama ng loob.',
  'Auto-balanced para walang tampuhan!',
  'Kaya mo yan! Bayaran mo na yung utang kay tropa.',
  'Walang takbuhan pagdating ng resibo!',
  'Bawat sentimo, kwentado. Walang short, walang over!',
];

export const InteractiveMascot = ({ className = '', showCounter = true, showPrompt = true }) => {
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
    sounds.playChomp();
    const nextCount = chomps + 1;
    setChomps(nextCount);
    try {
      localStorage.setItem(CHOMP_STORAGE_KEY, String(nextCount));
    } catch {
      /* ignore */
    }

    // Trigger squish animation
    setIsChomping(true);
    setTimeout(() => setIsChomping(false), 350);

    // Pick next quip
    setQuipIndex((prev) => (prev + 1) % QUIPS.length);
    setShowQuip(true);
    clearTimeout(quipTimer.current);
    quipTimer.current = setTimeout(() => setShowQuip(false), 4500);
  };

  return (
    <div
      ref={containerRef}
      className={`interactive-mascot-container ${className}`}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {/* Live Chomp Counter Pill (Clucky-inspired) */}
      {showCounter && (
        <div className="mascot-counter-pill liquid-glass-subtle animate-fade-in" role="status">
          <span className="counter-icon"><Sparkles size={14} className="sparkle-accent" /></span>
          <span className="counter-number">{chomps.toLocaleString()}</span>
          <span className="counter-label">{chomps === 1 ? 'chomp' : 'chomps'} and counting</span>
        </div>
      )}

      {/* Quip Speech Bubble */}
      {showQuip && (
        <div className="mascot-speech-bubble liquid-glass-card animate-pop" role="tooltip">
          <MessageCircle size={14} className="speech-icon" />
          <p className="speech-text">{QUIPS[quipIndex]}</p>
          <div className="speech-arrow" />
        </div>
      )}

      {/* Mascot Interactive Action Button */}
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
        <div className="mascot-badge-circle liquid-glass-card">
          <img
            src={mascotImg}
            alt="Gastosaurus mascot"
            className="hero-mascot-img"
            draggable={false}
          />
        </div>

        {/* Playful 'Click me!' Hint */}
        {showPrompt && !showQuip && chomps === 0 && (
          <div className="mascot-click-hint liquid-glass-subtle animate-pop">
            <span>Tap me! 🦕</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default InteractiveMascot;
