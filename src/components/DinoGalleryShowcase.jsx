import { useState } from 'react';
import dinoRex from '../assets/dinos/dino-green-rex.png';
import dinoSpiky from '../assets/dinos/dino-pink-spiky.png';
import dinoLongneck from '../assets/dinos/dino-purple-longneck.png';
import dinoTrike from '../assets/dinos/dino-teal-trike.png';
import dinoStego from '../assets/dinos/dino-green-stego.png';
import dinoBabyTrike from '../assets/dinos/dino-orange-baby-trike.png';
import dinoRoar from '../assets/dinos/dino-orange-roar.png';
import dinoEgg from '../assets/dinos/dino-green-egg.png';
import { sounds } from '../lib/sounds';
import { 
  Sparkles, 
  Play, 
  Pause, 
  ReceiptText, 
  CheckCircle2,
  Coffee,
  ShieldCheck,
  Zap,
  Calculator,
  TrendingUp
} from './CustomIcons';

const DINO_HERD = [
  {
    id: 'rex',
    name: 'Rex',
    title: 'The Tagasalo',
    tagline: 'Always pays the restaurant bill first, collects GCash later.',
    badge: 'Card Holder',
    category: 'Spenders',
    color: '#059669',
    img: dinoRex,
    quote: '"Kaskas ko muna, send na lang sa GCash!"',
  },
  {
    id: 'spiky',
    name: 'Spiky',
    title: 'The Centavo Auditor',
    tagline: 'Calculates the 10% service charge down to 25 centavos exact.',
    badge: 'Auditor',
    category: 'Accountants',
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
    category: 'Spenders',
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
    category: 'Spenders',
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
    category: 'Savers',
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
    category: 'Accountants',
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
    category: 'Savers',
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
    category: 'First-Timers',
    color: '#65A30D',
    img: dinoEgg,
    quote: '"Paano po mag-join sa group code sa Gastosaurus?"',
  },
];

const DINO_MAP = Object.fromEntries(DINO_HERD.map((d) => [d.id, d]));
const CATEGORIES = ['All', 'Spenders', 'Accountants', 'Savers', 'First-Timers'];

const BARKADA_ADVICE = [
  'Never split evenly when someone ordered the USDA Wagyu.',
  'Tagasalo points expire if GCash is delayed by 3 business days.',
  'The second cup of rice is always legally taxable under ambagan law.',
  'Auto-calculated service charge prevents 99% of barkada breakups.',
  'Send the GCash screenshot with the reference number intact.',
];

/**
 * Reusable Tactile Squircle Dino Tile (Devlets design language).
 */
const DinoTile = ({ dino, isSelected, isVisible, onSelect }) => (
  <div
    className={`herd-tile squircle-persona liquid-glass-card active-press ${
      isSelected ? 'active-herd-card' : ''
    } ${!isVisible ? 'dimmed' : ''}`}
    onClick={() => onSelect(dino.id)}
  >
    <div className="tile-top-row">
      <span className="tile-badge-pill" style={{ background: `${dino.color}18`, color: dino.color }}>
        {dino.badge}
      </span>
      <span className="tile-mini-tag">{dino.category}</span>
    </div>
    <div className="tile-dino-avatar">
      <img src={dino.img} alt={dino.name} className="tile-img animate-float" />
    </div>
    <h3 className="tile-dino-name">{dino.name}</h3>
    <p className="tile-dino-quote">{dino.quote}</p>
  </div>
);

/**
 * Devlets-Inspired 3-Row Nonstop Alternating Direction Herd Carousel.
 * Features tactile squircle micro-widgets, category pills, motion control,
 * and seamless gradient edge blending in Gastosaurus pink liquid glass theme.
 */
export const DinoGalleryShowcase = () => {
  const [selectedDinoId, setSelectedDinoId] = useState('spiky');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPaused, setIsPaused] = useState(false);
  const [adviceIndex, setAdviceIndex] = useState(0);

  const activeDino = DINO_MAP[selectedDinoId] || DINO_HERD[0];

  const handleSelectDino = (dinoId) => {
    sounds.playPop();
    setSelectedDinoId(dinoId);
  };

  const handleNextAdvice = (e) => {
    e.stopPropagation();
    sounds.playChomp();
    setAdviceIndex((prev) => (prev + 1) % BARKADA_ADVICE.length);
  };

  const isVisible = (dino) => selectedCategory === 'All' || dino.category === selectedCategory;

  return (
    <section id="herd" className="herd-catalog-section">
      <div className="herd-catalog-header">
        <h2 className="section-title">
          Meet the Herd: <span className="hero-title-accent text-gradient-shimmer">Pick Your Persona</span>
        </h2>
        <p className="section-subtitle">
          3-row nonstop live carousel. Hover to pause, click to inspect their barkada habits.
        </p>

        {/* Category Filter Pills & Auto-Scroll Pause Button (Devlets Style) */}
        <div className="herd-catalog-controls">
          <div className="herd-filter-pills" role="tablist" aria-label="Filter dinosaur archetypes">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`herd-pill-btn active-press ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="herd-pause-btn active-press liquid-glass-card"
            onClick={() => {
              sounds.playClick();
              setIsPaused((prev) => !prev);
            }}
            aria-label={isPaused ? 'Resume nonstop carousel motion' : 'Pause nonstop carousel motion'}
            title={isPaused ? 'Play motion' : 'Pause motion'}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>

      {/* 3-Row Nonstop Alternating Marquee Track */}
      <div 
        className="herd-catalog-track-wrap"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ─── ROW 1: Continuous Left Motion (Asymmetrical Devlets Cluster) ─── */}
        <div className={`herd-marquee-row herd-row-left ${isPaused ? 'paused' : ''}`}>
          {[...Array(2)].map((_, loopIdx) => (
            <div key={`r1-loop-${loopIdx}`} className="herd-cards-stream">
              {/* Tile: Dino Rex 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.rex} isSelected={selectedDinoId === 'rex'} isVisible={isVisible(DINO_MAP.rex)} onSelect={handleSelectDino} />

              {/* Cluster: Vertical Stacked Column of Two 2x1 Bricks */}
              <div className="herd-col-stacked">
                <div className="herd-tile squircle-2x1 tile-dark-glass active-press" onClick={() => sounds.playPop()}>
                  <div className="tile-compact-top">
                    <span className="tile-badge-pill badge-green"><CheckCircle2 size={11} /> SHIP IT</span>
                    <span className="tile-mono-tag">0.00¢</span>
                  </div>
                  <p className="tile-compact-text">Safe to settle debts with zero chat drama.</p>
                </div>
                <div className="herd-tile squircle-2x1 liquid-glass-card active-press" onClick={() => sounds.playClick()}>
                  <div className="tile-compact-top">
                    <span className="tile-badge-pill badge-pink"><ReceiptText size={11} /> 10% SC</span>
                    <span className="tile-mini-tag">CENTAVO</span>
                  </div>
                  <p className="tile-compact-text">Service charges split proportionally.</p>
                </div>
              </div>

              {/* Tile: Micro Calculation 4x2 Wide Card */}
              <div className="herd-tile squircle-wide liquid-glass-card active-press" onClick={() => sounds.playClick()}>
                <div className="tile-top-row">
                  <span className="tile-badge-pill badge-pink"><ReceiptText size={11} /> Samgyup Split</span>
                  <span className="tile-live-dot">● LIVE MATH</span>
                </div>
                <div className="tile-math-body">
                  <div className="math-total-line">
                    <span>₱1,200 Brisket + ₱380 Fries</span>
                    <strong>₱450.25 / pax</strong>
                  </div>
                  <div className="math-pax-dinos">
                    <img src={dinoRex} alt="" className="math-dino-icon" />
                    <img src={dinoSpiky} alt="" className="math-dino-icon" />
                    <img src={dinoTrike} alt="" className="math-dino-icon" />
                    <span className="math-tagline">10% SC included</span>
                  </div>
                </div>
              </div>

              {/* Tile: Dino Spiky 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.spiky} isSelected={selectedDinoId === 'spiky'} isVisible={isVisible(DINO_MAP.spiky)} onSelect={handleSelectDino} />

              {/* Cluster: Vertical Stacked Column of Two 2x1 Bricks */}
              <div className="herd-col-stacked">
                <div className="herd-tile squircle-2x1 tile-dark-glass active-press" onClick={() => sounds.playPop()}>
                  <div className="tile-compact-top">
                    <span className="tile-metric-digit">99</span>
                    <span className="tile-mono-tag">KARMA</span>
                  </div>
                  <div className="tile-metric-sub">Never ghosted when the bill arrived.</div>
                </div>
                <div className="herd-tile squircle-2x1 liquid-glass-card active-press" onClick={() => sounds.playClick()}>
                  <div className="tile-compact-top">
                    <span className="tile-badge-pill badge-purple"><Coffee size={11} /> Extra Rice</span>
                    <span className="tile-mini-tag">+₱45</span>
                  </div>
                  <p className="tile-compact-text">Itemized automatically to eater.</p>
                </div>
              </div>

              {/* Tile: Dino Longneck 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.longneck} isSelected={selectedDinoId === 'longneck'} isVisible={isVisible(DINO_MAP.longneck)} onSelect={handleSelectDino} />
            </div>
          ))}
        </div>

        {/* ─── ROW 2: Continuous Right Motion (Asymmetrical Devlets Cluster) ─── */}
        <div className={`herd-marquee-row herd-row-right ${isPaused ? 'paused' : ''}`}>
          {[...Array(2)].map((_, loopIdx) => (
            <div key={`r2-loop-${loopIdx}`} className="herd-cards-stream">
              {/* Tile: GCash Direct Settle 4x2 Wide Card */}
              <div className="herd-tile squircle-wide liquid-glass-card active-press" onClick={() => sounds.playPop()}>
                <div className="tile-top-row">
                  <span className="tile-badge-pill badge-green"><CheckCircle2 size={11} /> N-1 Settlement</span>
                  <span className="tile-mini-tag">GCash Verified</span>
                </div>
                <div className="tile-settle-preview">
                  <div className="settle-avatars-flow">
                    <span>Bea</span>
                    <span className="flow-arrow">→</span>
                    <span>Alex</span>
                    <strong>₱450.00</strong>
                  </div>
                  <span className="settle-collapsed-tag">5 debts collapsed into 2 direct transfers</span>
                </div>
              </div>

              {/* Tile: Dino Roar 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.roar} isSelected={selectedDinoId === 'roar'} isVisible={isVisible(DINO_MAP.roar)} onSelect={handleSelectDino} />

              {/* Cluster: Vertical Stacked Column of Two 2x1 Bricks */}
              <div className="herd-col-stacked">
                <div className="herd-tile squircle-2x1 tile-dark-glass active-press" onClick={() => sounds.playClick()}>
                  <div className="tile-compact-top">
                    <span className="tile-metric-digit text-pink">0.00¢</span>
                    <span className="tile-mono-tag">ROUNDING</span>
                  </div>
                  <div className="tile-metric-sub">Largest remainder absorbs leftover 1¢.</div>
                </div>
                <div className="herd-tile squircle-2x1 liquid-glass-card active-press" onClick={() => sounds.playPop()}>
                  <div className="tile-compact-top">
                    <span className="tile-badge-pill badge-green"><ShieldCheck size={11} /> Tagasalo</span>
                    <span className="tile-mini-tag">ACTIVE</span>
                  </div>
                  <p className="tile-compact-text">1-tap instant payment collection.</p>
                </div>
              </div>

              {/* Tile: Dino Stego 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.stego} isSelected={selectedDinoId === 'stego'} isVisible={isVisible(DINO_MAP.stego)} onSelect={handleSelectDino} />

              {/* Cluster: Vertical Stacked Column of Two 2x1 Bricks */}
              <div className="herd-col-stacked">
                <div className="herd-tile squircle-2x1 liquid-glass-card active-press" onClick={() => sounds.playPop()}>
                  <div className="tile-compact-top">
                    <span className="tile-metric-digit text-purple">100%</span>
                    <span className="tile-mono-tag">CLARITY</span>
                  </div>
                  <div className="tile-metric-sub">No awkward group chat follow-ups.</div>
                </div>
                <div className="herd-tile squircle-2x1 tile-dark-glass active-press" onClick={() => sounds.playClick()}>
                  <div className="tile-compact-top">
                    <span className="tile-badge-pill badge-pink"><Zap size={11} /> Maya / GCash</span>
                    <span className="tile-mini-tag">READY</span>
                  </div>
                  <p className="tile-compact-text">Direct QR code copy & settle.</p>
                </div>
              </div>

              {/* Tile: Dino Trike 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.trike} isSelected={selectedDinoId === 'trike'} isVisible={isVisible(DINO_MAP.trike)} onSelect={handleSelectDino} />
            </div>
          ))}
        </div>

        {/* ─── ROW 3: Continuous Left Motion (Asymmetrical Devlets Cluster) ─── */}
        <div className={`herd-marquee-row herd-row-left-alt ${isPaused ? 'paused' : ''}`}>
          {[...Array(2)].map((_, loopIdx) => (
            <div key={`r3-loop-${loopIdx}`} className="herd-cards-stream">
              {/* Tile: Dino Egg 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.egg} isSelected={selectedDinoId === 'egg'} isVisible={isVisible(DINO_MAP.egg)} onSelect={handleSelectDino} />

              {/* Tile: Dino Baby Trike 2x2 Squircle */}
              <DinoTile dino={DINO_MAP['baby-trike']} isSelected={selectedDinoId === 'baby-trike'} isVisible={isVisible(DINO_MAP['baby-trike'])} onSelect={handleSelectDino} />

              {/* Tile: Interactive Dino Advice Fortune 4x2 Wide Card */}
              <div className="herd-tile squircle-wide squircle-advice liquid-glass-card active-press" onClick={handleNextAdvice}>
                <div className="tile-top-row">
                  <span className="tile-badge-pill badge-purple"><Sparkles size={11} /> Barkada Wisdom</span>
                  <span className="tile-mini-tag">Tap for Advice ✦</span>
                </div>
                <div className="advice-body">
                  <p className="advice-text">&quot;{BARKADA_ADVICE[adviceIndex]}&quot;</p>
                  <span className="advice-hint">Next advice →</span>
                </div>
              </div>

              {/* Cluster: Vertical Stacked Column of Two 2x1 Bricks */}
              <div className="herd-col-stacked">
                <div className="herd-tile squircle-2x1 tile-dark-glass active-press" onClick={() => sounds.playPop()}>
                  <div className="tile-compact-top">
                    <span className="tile-metric-digit text-pink">1.8B¢</span>
                    <span className="tile-mono-tag">EXACT</span>
                  </div>
                  <div className="tile-metric-sub">Zero centavo floating drift math.</div>
                </div>
                <div className="herd-tile squircle-2x1 liquid-glass-card active-press" onClick={() => sounds.playClick()}>
                  <div className="tile-compact-top">
                    <span className="tile-badge-pill badge-green"><TrendingUp size={11} /> Auto-Split</span>
                    <span className="tile-mini-tag">N-1</span>
                  </div>
                  <p className="tile-compact-text">Collapses chains to minimal transfers.</p>
                </div>
              </div>

              {/* Tile: Dino Spiky 2x2 Squircle */}
              <DinoTile dino={DINO_MAP.spiky} isSelected={selectedDinoId === 'spiky'} isVisible={isVisible(DINO_MAP.spiky)} onSelect={handleSelectDino} />

              {/* Cluster: Vertical Stacked Column of Two 2x1 Bricks */}
              <div className="herd-col-stacked">
                <div className="herd-tile squircle-2x1 liquid-glass-card active-press" onClick={() => sounds.playClick()}>
                  <div className="tile-compact-top">
                    <span className="tile-badge-pill badge-pink"><Calculator size={11} /> Real-Time</span>
                  </div>
                  <p className="tile-compact-text">Live recalculation on dish assignment.</p>
                </div>
                <div className="herd-tile squircle-2x1 tile-dark-glass active-press" onClick={() => sounds.playPop()}>
                  <div className="tile-compact-top">
                    <span className="tile-metric-digit">0</span>
                    <span className="tile-mono-tag">DRAMA</span>
                  </div>
                  <div className="tile-metric-sub">100% transparent group finances.</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Dino Active Spotlight Banner */}
      <div className="active-dino-banner liquid-glass-card animate-fade-in" style={{ borderColor: `${activeDino.color}40` }}>
        <div className="active-dino-avatar-col">
          <img src={activeDino.img} alt={activeDino.name} className="active-dino-spotlight-img animate-float" />
        </div>
        <div className="active-dino-info-col">
          <span className="active-dino-role" style={{ color: activeDino.color }}>
            {activeDino.title} · {activeDino.badge} ({activeDino.category})
          </span>
          <h3 className="active-dino-quote">{activeDino.quote}</h3>
          <p className="active-dino-desc">{activeDino.tagline}</p>
        </div>
      </div>
    </section>
  );
};

export default DinoGalleryShowcase;
