import mascotImg from '../assets/mascot.png';
import { sounds } from '../lib/sounds';
import { 
  ArrowUp, 
  Sparkles, 
  CheckCircle2, 
  Download
} from './CustomIcons';

const FOOTER_SECTIONS = [
  {
    title: 'Experience',
    links: [
      { label: 'Mobile App Showcase', id: 'showcase' },
      { label: 'Quick Split Calculator', id: 'calculator' },
      { label: 'The Dinosaur Herd', id: 'herd' },
      { label: 'Settle-Up Matrix', id: 'settle' },
      { label: 'Core Features', id: 'features' },
    ],
  },
  {
    title: 'Ambagan Engine',
    links: [
      { label: 'Itemized Receipt Breakdown', id: 'features' },
      { label: 'Centavo Remainder Rule', id: 'calculator' },
      { label: 'N-1 Debt-Chain Collapse', id: 'settle' },
      { label: 'GCash & Maya Ready', id: 'settle' },
      { label: 'Zero Drama Math', id: 'herd' },
    ],
  },
];

export const LandingFooter = ({ onOpenDownload, onOpenAuth }) => {
  const handleScrollTo = (id) => {
    sounds.playPop();
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

  const handleBackToTop = () => {
    sounds.playSuccess();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="landing-footer" role="contentinfo">
      <div className="landing-footer-inner">
        {/* Top Grid: Brand & Navigation */}
        <div className="footer-top-grid">
          {/* Brand Info & Mascot Logo */}
          <div className="footer-brand-col">
            <div 
              className="footer-brand-header active-press" 
              onClick={handleBackToTop}
              role="button"
              tabIndex={0}
              aria-label="Gastosaurus home"
            >
              <div className="footer-mascot-avatar">
                <img src={mascotImg} alt="Gastosaurus logo" className="footer-mascot-img" />
              </div>
              <div className="footer-brand-title-wrap">
                <span className="footer-brand-name">Gastosaurus</span>
                <span className="footer-brand-tagline">100% computed, 0% sama ng loob.</span>
              </div>
            </div>

            <p className="footer-brand-desc">
              The modern expense splitting companion engineered for every Filipino barkada. 
              Equal splits, itemized samgyupsal bills, and exact centavo math with zero drama.
            </p>

            <div className="footer-badges-row">
              <span className="footer-pill-badge">
                <CheckCircle2 size={12} color="#059669" />
                <span>Tagasalo Certified</span>
              </span>
              <span className="footer-pill-badge">
                <Sparkles size={12} color="#E2486E" />
                <span>0.00¢ Exact Math</span>
              </span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="footer-links-group">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className="footer-links-col">
                <h3 className="footer-col-title">{section.title}</h3>
                <ul className="footer-links-list">
                  {section.links.map((link, idx) => (
                    <li key={`${section.title}-${idx}`}>
                      <button
                        type="button"
                        className="footer-link-btn"
                        onClick={() => handleScrollTo(link.id)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Actions & PWA Download Column */}
          <div className="footer-cta-col">
            <h3 className="footer-col-title">Get Started</h3>
            <p className="footer-cta-desc">
              Ready to stop awkward bill computations? Launch the app directly in your browser or install to your device.
            </p>
            <div className="footer-cta-buttons">
              {onOpenDownload && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm footer-install-btn active-press"
                  onClick={() => {
                    sounds.playClick();
                    onOpenDownload();
                  }}
                >
                  <Download size={14} />
                  <span>Install App</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm footer-login-btn active-press"
                onClick={() => {
                  sounds.playClick();
                  onOpenAuth?.('login');
                }}
              >
                <span>Log In / Sign Up</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © 2026 Gastosaurus.
          </p>

          <button
            type="button"
            className="footer-back-to-top-btn liquid-glass-card active-press"
            onClick={handleBackToTop}
            aria-label="Scroll back to top"
            title="Back to Top"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
