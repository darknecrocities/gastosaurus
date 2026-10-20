import { useState } from 'react';
import mascotImg from '../assets/mascot.png';
import InteractiveMascot from './InteractiveMascot';
import QuickSplitCalculator from './QuickSplitCalculator';
import SettleUpVisualizer from './SettleUpVisualizer';
import PhoneAppCarousel from './PhoneAppCarousel';
import DinoGalleryShowcase from './DinoGalleryShowcase';
import FloatingDinosBackground from './FloatingDinosBackground';
import RotatingHeadline from './RotatingHeadline';
import KineticMarquee from './KineticMarquee';
import ScrollReveal from './ScrollReveal';
import { sounds } from '../lib/sounds';
import { 
  Globe, 
  Calendar, 
  ReceiptIcon, 
  CalculatorIcon, 
  HandshakeIcon,
  Volume2,
  VolumeX,
  ArrowRight,
  Download
} from './CustomIcons';

export const LandingPage = ({
  onStartSaving,
  onOpenAuth,
  onOpenDashboard,
  onOpenDownload,
  isLoggedIn = false
}) => {
  const [isAudioActive, setIsAudioActive] = useState(() => sounds.isEnabled());

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setIsAudioActive(next);
  };

  return (
    <div className="landing-page-container editorial-typography-theme">
      {/* Ambient Floating Dinos with Parallax Depth */}
      <FloatingDinosBackground />

      {/* Floating Big Glassmorphism Top Header */}
      <header className="landing-header liquid-glass-subtle">
        <div className="navbar-brand landing-brand">
          <span className="mascot-avatar-wrapper liquid-glass-subtle">
            <img src={mascotImg} alt="" className="mascot-avatar-img" />
          </span>
          <span className="brand-name">Gastosaurus</span>
        </div>

        <div className="landing-header-actions">
          {/* Sound Mute Toggle Pill */}
          <button
            type="button"
            className="sound-toggle-pill liquid-glass-card active-press"
            onClick={handleToggleSound}
            aria-label={isAudioActive ? 'Mute sound effects' : 'Enable sound effects'}
            title={isAudioActive ? 'Sound is ON' : 'Sound is OFF'}
          >
            {isAudioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="sound-toggle-text">{isAudioActive ? 'Sound ON' : 'Muted'}</span>
          </button>

          {/* Download App Pill Button */}
          {onOpenDownload && (
            <button
              type="button"
              className="download-nav-btn liquid-glass-card active-press"
              onClick={() => {
                sounds.playClick();
                onOpenDownload();
              }}
              title="Download & Install Gastosaurus PWA"
            >
              <Download size={15} />
              <span>Download App</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline active-press"
            onClick={() => {
              sounds.playClick();
              if (isLoggedIn) onOpenDashboard?.();
              else onOpenAuth?.('login');
            }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Log In'}
          </button>
        </div>
      </header>

      {/* Hero Section with Bold Editorial Rotating Headline */}
      <section className="landing-hero-section">
        <div className="landing-hero-content">
          <ScrollReveal animation="fade-up" className="hero-text-col">
            <RotatingHeadline />

            <p className="hero-subtitle">
              Split bills ambagan-style, item by item. Keep track of who owes who, collapse debt chains, and eliminate awkward money talks.
            </p>

            <div className="hero-cta-group">
              <button 
                className="btn btn-primary btn-lg btn-start-saving active-press"
                onClick={() => {
                  sounds.playClick();
                  onStartSaving?.();
                }}
                id="start-saving-btn"
              >
                <span>Start Saving</span>
                <ArrowRight size={18} />
              </button>

              {onOpenDownload && (
                <button
                  type="button"
                  className="btn btn-outline btn-lg active-press"
                  onClick={() => {
                    sounds.playClick();
                    onOpenDownload();
                  }}
                >
                  <Download size={18} />
                  <span>Get App</span>
                </button>
              )}
            </div>
          </ScrollReveal>

          {/* Clucky-Inspired Interactive Mascot Column */}
          <ScrollReveal animation="scale-up" delay={150} className="hero-visual-col">
            <InteractiveMascot showPrompt={true} />
          </ScrollReveal>
        </div>
      </section>

      {/* Dual-Direction Kinetic Typography Marquee Ribbon */}
      <KineticMarquee />

      {/* 02 // Non-Stop Looping 4-Row Smartphone Frame Carousel */}
      <ScrollReveal animation="fade-up">
        <div className="section-editorial-marker">
          <span className="marker-index">02 // HARDWARE PREVIEW</span>
        </div>
        <PhoneAppCarousel />
      </ScrollReveal>

      {/* 03 // Real-time Interactive Quick Split Calculator Widget */}
      <ScrollReveal animation="fade-up">
        <section className="landing-calculator-section">
          <div className="section-editorial-marker">
            <span className="marker-index">03 // CENTAVO ENGINE</span>
          </div>
          <div className="calc-section-inner">
            <QuickSplitCalculator onStartSaving={onStartSaving} />
          </div>
        </section>
      </ScrollReveal>

      {/* 04 // Interactive Cursor-Tracked Dinosaur Herd Gallery */}
      <ScrollReveal animation="fade-up">
        <div className="section-editorial-marker">
          <span className="marker-index">04 // THE HERD ARCHETYPES</span>
        </div>
        <DinoGalleryShowcase />
      </ScrollReveal>

      {/* 05 // Middle Glass Strip: Smart Categorization & Bill Reminders */}
      <ScrollReveal animation="fade-up">
        <section className="landing-features-strip">
          <div className="section-editorial-marker">
            <span className="marker-index">05 // FINANCIAL CLARITY</span>
          </div>
          <div className="features-strip-inner liquid-glass-card">
            <div className="feature-strip-item">
              <div className="feature-strip-icon-wrapper liquid-glass-subtle">
                <Globe size={36} strokeWidth={1.75} className="feature-strip-icon" />
              </div>
              <div className="feature-strip-text">
                <h2 className="feature-strip-title">Smart Categorization</h2>
                <p className="feature-strip-desc">
                  Clarifies and gamifies expense sharing across trips, samgyupsal nights, and house bills.
                </p>
              </div>
            </div>

            <div className="feature-strip-item">
              <div className="feature-strip-icon-wrapper liquid-glass-subtle">
                <Calendar size={36} strokeWidth={1.75} className="feature-strip-icon" />
              </div>
              <div className="feature-strip-text">
                <h2 className="feature-strip-title">Bill Reminders</h2>
                <p className="feature-strip-desc">
                  Gentle nudges before a bill is due, so nobody has to chase the barkada for payments.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 06 // Debt Chain Minimizer Story Demo */}
      <ScrollReveal animation="fade-up">
        <section className="landing-visualizer-section">
          <div className="section-editorial-marker">
            <span className="marker-index">06 // THE SETTLEMENT MATRIX</span>
          </div>
          <div className="visualizer-section-inner">
            <SettleUpVisualizer />
          </div>
        </section>
      </ScrollReveal>

      {/* 07 // Bottom Section: 3 Tactile Liquid Glass Bento Cards */}
      <ScrollReveal animation="fade-up">
        <section className="landing-bottom-cards-section">
          <div className="bottom-cards-grid">
            {/* Card 1: Itemized Ambagan */}
            <div className="feature-card liquid-glass-card active-press">
              <div className="card-icon-box liquid-glass-subtle">
                <ReceiptIcon size={24} color="#E2486E" />
              </div>
              <div className="card-body">
                <h3 className="card-title">Itemized Ambagan</h3>
                <p className="card-text">
                  I-tag na &apos;yung palaging may extra rice at extra Coke Float sa order, automatic na ang re-compute. Wala nang &apos;ay mali yata bilang ko&apos;.
                </p>
              </div>
            </div>

            {/* Card 2: Auto-Balance */}
            <div className="feature-card liquid-glass-card active-press">
              <div className="card-icon-box liquid-glass-subtle">
                <CalculatorIcon size={24} color="#5B3A84" />
              </div>
              <div className="card-body">
                <h3 className="card-title">Auto-Balance</h3>
                <p className="card-text">
                  Paalam na, Google Sheets puno ng #REF! error. Kami na ang bahala sa hirap ng math, para walang samaan ng loob sa barkada.
                </p>
              </div>
            </div>

            {/* Card 3: Easy Settle-Up */}
            <div className="feature-card liquid-glass-card active-press">
              <div className="card-icon-box liquid-glass-subtle">
                <HandshakeIcon size={24} color="#059669" />
              </div>
              <div className="card-body">
                <h3 className="card-title">Easy Settle-Up</h3>
                <p className="card-text">
                  Alamin agad kung sino may utang sa isang tap lang. Debt chains collapse automatically into direct, minimum payment steps.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default LandingPage;
