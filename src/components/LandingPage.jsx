import { useState, useEffect } from 'react';
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
import LandingFooter from './LandingFooter';
import { sounds } from '../lib/sounds';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { 
  Globe, 
  Calendar, 
  ReceiptIcon, 
  CalculatorIcon, 
  HandshakeIcon,
  Volume2,
  VolumeX,
  ArrowRight,
  Download,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from './CustomIcons';

const NAV_SECTIONS = [
  { id: 'showcase', label: 'Showcase' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'herd', label: 'The Herd' },
  { id: 'settle', label: 'Settle-Up' },
  { id: 'features', label: 'Features' },
];

export const LandingPage = ({
  onStartSaving,
  onOpenAuth,
  onOpenDashboard,
  onOpenDownload,
  isLoggedIn = false
}) => {
  const [isAudioActive, setIsAudioActive] = useState(() => sounds.isEnabled());
  const [activeSection, setActiveSection] = useState('showcase');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { canInstall, promptInstall } = usePwaInstall();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const sectionIds = ['showcase', 'calculator', 'herd', 'settle', 'features'];
    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    sounds.playPop();
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setIsAudioActive(next);
  };

  const handleDownloadClick = async () => {
    sounds.playClick();
    if (canInstall) {
      const res = await promptInstall();
      if (res?.accepted) {
        sounds.playSuccess();
        return;
      }
    }
    if (onOpenDownload) {
      onOpenDownload();
    }
  };

  return (
    <div className="landing-page-container editorial-typography-theme">
      {/* Ambient Floating Dinos with Parallax Depth */}
      <FloatingDinosBackground />

      {/* Mobile Backdrop Scrim Overlay (rendered outside header to avoid stacking context & blur traps) */}
      {isMobileMenuOpen && (
        <div
          className="landing-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Big Glassmorphism Top Header */}
      <header className={`landing-header liquid-glass-subtle ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="navbar-brand landing-brand">
          <span className="mascot-avatar-wrapper">
            <img src={mascotImg} alt="" className="mascot-avatar-img" />
          </span>
          <span className="brand-name">Gastosaurus</span>
        </div>

        {/* Unified Navbar Section Navigation Capsule */}
        <nav className="navbar-section-capsule" aria-label="Section navigation">
          {NAV_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`capsule-section-btn active-press ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => scrollToSection(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </nav>

        {/* Desktop Header Actions (Hidden on <= 768px) */}
        <div className="landing-header-actions desktop-header-actions">
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

          {/* Install App Pill Button */}
          {onOpenDownload && (
            <button
              type="button"
              className="download-nav-btn navbar-install-btn liquid-glass-card active-press"
              onClick={handleDownloadClick}
              title="Install Gastosaurus PWA"
              aria-label="Install Gastosaurus App"
            >
              <Download size={15} />
              <span>Install App</span>
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

        {/* Mobile Header Triggers (Visible only on <= 768px) */}
        <div className="landing-header-mobile-triggers">
          <button
            type="button"
            className="mobile-sound-btn active-press"
            onClick={handleToggleSound}
            aria-label={isAudioActive ? 'Mute sound' : 'Enable sound'}
            title={isAudioActive ? 'Sound ON' : 'Sound OFF'}
          >
            {isAudioActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            className={`mobile-burger-btn active-press ${isMobileMenuOpen ? 'is-active' : ''}`}
            onClick={() => {
              sounds.playPop();
              setIsMobileMenuOpen((prev) => !prev);
            }}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Slide-Down Liquid Glass Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="landing-mobile-drawer liquid-glass-card animate-slide-down" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">Navigation</span>
              <span className="mobile-drawer-badge">
                <Sparkles size={11} color="#E2486E" /> Menu
              </span>
            </div>

            <nav className="mobile-drawer-nav" aria-label="Mobile section navigation">
              {NAV_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`mobile-nav-link active-press ${activeSection === sec.id ? 'active' : ''}`}
                  onClick={() => {
                    scrollToSection(sec.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="mobile-nav-label">{sec.label}</span>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </button>
              ))}
            </nav>

            <div className="mobile-drawer-actions">
              {onOpenDownload && (
                <button
                  type="button"
                  className="btn btn-primary btn-block mobile-drawer-install-btn active-press"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleDownloadClick();
                  }}
                >
                  <Download size={16} />
                  <span>Install Gastosaurus PWA</span>
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline btn-block active-press"
                onClick={() => {
                  sounds.playClick();
                  setIsMobileMenuOpen(false);
                  if (isLoggedIn) onOpenDashboard?.();
                  else onOpenAuth?.('login');
                }}
              >
                <span>{isLoggedIn ? 'Go to Dashboard' : 'Log In / Sign Up'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
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
                  onClick={handleDownloadClick}
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

      {/* Non-Stop Looping 4-Row Smartphone Frame Carousel */}
      <ScrollReveal animation="fade-up">
        <PhoneAppCarousel />
      </ScrollReveal>

      {/* Real-time Interactive Quick Split Calculator Widget */}
      <ScrollReveal animation="fade-up">
        <section id="calculator" className="landing-calculator-section">
          <div className="calc-section-inner">
            <QuickSplitCalculator onStartSaving={onStartSaving} />
          </div>
        </section>
      </ScrollReveal>

      {/* Interactive Dinosaur Herd Gallery */}
      <ScrollReveal animation="fade-up">
        <DinoGalleryShowcase />
      </ScrollReveal>

      {/* Middle Glass Strip: Smart Categorization & Bill Reminders */}
      <ScrollReveal animation="fade-up">
        <section className="landing-features-strip">
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

      {/* Debt Chain Minimizer Story Demo */}
      <ScrollReveal animation="fade-up">
        <section id="settle" className="landing-visualizer-section">
          <div className="visualizer-section-inner">
            <SettleUpVisualizer />
          </div>
        </section>
      </ScrollReveal>

      {/* 07 // Bottom Section: 3 Tactile Liquid Glass Bento Cards */}
      <ScrollReveal animation="fade-up">
        <section id="features" className="landing-bottom-cards-section">
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

      {/* Website Footer with Gastosaurus Logo & Navigation */}
      <LandingFooter onOpenDownload={onOpenDownload} onOpenAuth={onOpenAuth} />
    </div>
  );
};

export default LandingPage;
