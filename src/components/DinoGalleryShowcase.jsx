import { useState, useRef, useCallback } from 'react';
import dinoRex from '../assets/dinos/dino-green-rex.png';
import dinoSpiky from '../assets/dinos/dino-pink-spiky.png';
import dinoLongneck from '../assets/dinos/dino-purple-longneck.png';
import dinoTrike from '../assets/dinos/dino-teal-trike.png';
import dinoStego from '../assets/dinos/dino-green-stego.png';
import dinoBabyTrike from '../assets/dinos/dino-orange-baby-trike.png';
import dinoRoar from '../assets/dinos/dino-orange-roar.png';
import dinoEgg from '../assets/dinos/dino-green-egg.png';
import { sounds } from '../lib/sounds';
import { ChevronLeft, ChevronRight, Sparkles, Compass } from './CustomIcons';

const DINO_HERD = [
  {
    id: 'rex',
    name: 'Rex',
    title: 'The Tagasalo',
    tagline: 'Always pays the restaurant bill first, collects GCash later.',
    badge: 'Card Holder',
    color: '#059669',
    img: dinoRex,
    quote: '"Kaskas ko muna, send na lang kayo sa GCash!"',
  },
  {
    id: 'spiky',
    name: 'Spiky',
    title: 'The Centavo Auditor',
    tagline: 'Calculates the 10% service charge down to 25 centavos exact.',
    badge: 'Auditor',
    color: '#E2486E',
    img: dinoSpiky,
    quote: '"Wait, sino may order nung extra truffle dip?"',
  },
  {
    id: 'trike',
    name: 'Trike',
    title: 'The Extra Rice Fan',
    tagline: 'Never forgets their add-ons and always settles debts instantly.',
    badge: 'Quick Payer',
    color: '#0D9488',
    img: dinoTrike,
    quote: '"Kasama na yung second cup of rice sa ambag ko!"',
  },
  {
    id: 'longneck',
    name: 'Longneck',
    title: 'The Big Spender',
    tagline: 'Suggests ordering the wagyu platter and two desserts for the table.',
    badge: 'Foodie',
    color: '#7C3AED',
    img: dinoLongneck,
    quote: '"Minsan lang tayo mabuhay, orderin na natin lahat!"',
  },
  {
    id: 'roar',
    name: 'Roar',
    title: 'The Gentle Reminder',
    tagline: 'Kindly drops the QR code in the group chat at 10 PM.',
    badge: 'Organizer',
    color: '#EA580C',
    img: dinoRoar,
    quote: '"Hello po sa mga hindi pa nakaka-ambag, love you all!"',
  },
  {
    id: 'stego',
    name: 'Stego',
    title: 'The Housemate Accountant',
    tagline: 'Automates electricity, water, and condo rent splits without sweat.',
    badge: 'Housemate',
    color: '#16A34A',
    img: dinoStego,
    quote: '"Kalahati sa Meralco, tapos hati tayo sa drinking water."',
  },
  {
    id: 'baby-trike',
    name: 'Baby Trike',
    title: 'The Budget Student',
    tagline: 'Knows every student discount, happy hour promo, and BOGO coupon.',
    badge: 'Saver',
    color: '#D97706',
    img: dinoBabyTrike,
    quote: '"May 20% student discount kung ipakita natin school ID!"',
  },
  {
    id: 'egg',
    name: 'Dino Egg',
    title: 'The First-Timer',
    tagline: 'Just hatched into the barkada trip, ready to learn the ambagan way.',
    badge: 'Rookie',
    color: '#65A30D',
    img: dinoEgg,
    quote: '"Paano po mag-join sa group code sa Gastosaurus?"',
  },
];

export const DinoGalleryShowcase = () => {
  const [selectedDinoId, setSelectedDinoId] = useState('spiky');
  const scrollContainerRef = useRef(null);

  const activeDino = DINO_HERD.find((d) => d.id === selectedDinoId) || DINO_HERD[0];

  // Cursor-driven horizontal panning across the section
  const handleSectionMouseMove = useCallback((e) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const clampedRatio = Math.max(0, Math.min(1, relativeX));

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll > 0) {
      container.scrollTo({
        left: clampedRatio * maxScroll,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleScrollStep = (direction) => {
    sounds.playClick();
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleSelectDino = (dino) => {
    sounds.playPop();
    setSelectedDinoId(dino.id);
  };

  return (
    <section className="dino-gallery-section" onMouseMove={handleSectionMouseMove}>
      <div className="dino-gallery-header">
        <div className="section-pill liquid-glass-subtle">
          <Compass size={15} color="#E2486E" />
          <span>Interactive Dinosaur Herd</span>
        </div>
        <h2 className="section-title">
          Meet the Herd: <span className="hero-title-accent text-gradient-shimmer">Pick Your Persona</span>
        </h2>
        <p className="section-subtitle">
          Hover or move your cursor sideways to explore every dinosaur. Tap any avatar to inspect their ambagan personality.
        </p>

        {/* Gallery Scroll Controls */}
        <div className="gallery-nav-buttons">
          <button
            type="button"
            className="gallery-nav-btn active-press liquid-glass-card"
            onClick={() => handleScrollStep('left')}
            aria-label="Scroll gallery left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="gallery-nav-btn active-press liquid-glass-card"
            onClick={() => handleScrollStep('right')}
            aria-label="Scroll gallery right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontally Panning Gallery Track */}
      <div className="dino-gallery-scroll-wrapper">
        <div ref={scrollContainerRef} className="dino-gallery-track">
          {DINO_HERD.map((dino) => {
            const isSelected = dino.id === selectedDinoId;
            return (
              <div
                key={dino.id}
                className={`dino-showcase-card liquid-glass-card active-press ${isSelected ? 'active-dino-card' : ''}`}
                onClick={() => handleSelectDino(dino)}
                onMouseEnter={() => sounds.playPop()}
                style={{
                  '--dino-accent': dino.color,
                }}
              >
                <div className="dino-card-badge-row">
                  <span className="dino-role-badge" style={{ backgroundColor: `${dino.color}18`, color: dino.color }}>
                    {dino.badge}
                  </span>
                </div>

                <div className="dino-card-avatar-wrap">
                  <img src={dino.img} alt={dino.name} className="dino-card-avatar-img" />
                </div>

                <h3 className="dino-card-name">{dino.name}</h3>
                <h4 className="dino-card-title">{dino.title}</h4>
                <p className="dino-card-tagline">{dino.tagline}</p>

                {isSelected && (
                  <div className="dino-selected-indicator animate-pop">
                    <Sparkles size={14} color={dino.color} />
                    <span>Selected</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Dino Highlight Banner */}
      <div className="active-dino-banner liquid-glass-card animate-fade-in" style={{ borderColor: `${activeDino.color}40` }}>
        <div className="active-dino-avatar-col">
          <img src={activeDino.img} alt={activeDino.name} className="active-dino-spotlight-img animate-float" />
        </div>
        <div className="active-dino-info-col">
          <span className="active-dino-role" style={{ color: activeDino.color }}>
            {activeDino.title} · {activeDino.badge}
          </span>
          <h3 className="active-dino-quote">{activeDino.quote}</h3>
          <p className="active-dino-desc">{activeDino.tagline}</p>
        </div>
      </div>
    </section>
  );
};

export default DinoGalleryShowcase;
