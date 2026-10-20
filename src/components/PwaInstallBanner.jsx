import { useState, useEffect } from 'react';
import mascotImg from '../assets/mascot.png';
import { sounds } from '../lib/sounds';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Download, X, Sparkles, Share } from './CustomIcons';

/**
 * Floating PWA Smart Install Banner.
 * Automatically surfaces on supported mobile & desktop browsers after 2.5s,
 * allowing 1-tap direct automatic PWA installation or iOS home-screen guidance.
 */
export const PwaInstallBanner = ({ onOpenGuide, showToast }) => {
  const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [hasDismissed, setHasDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !!window.sessionStorage.getItem('gastosaurus_pwa_dismissed');
  });
  const [timerElapsed, setTimerElapsed] = useState(false);

  useEffect(() => {
    if (isInstalled || hasDismissed) return undefined;

    const timer = setTimeout(() => {
      setTimerElapsed(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isInstalled, hasDismissed]);

  const isVisible = timerElapsed && !isInstalled && !hasDismissed;

  if (!isVisible) {
    return null;
  }

  const handleInstall = async () => {
    sounds.playClick();
    if (canInstall) {
      const res = await promptInstall();
      if (res?.accepted) {
        sounds.playSuccess();
        setHasDismissed(true);
        if (showToast) showToast('Gastosaurus installed to your home screen! 🦖', 'success');
        return;
      }
    }
    // If browser requires manual flow (e.g. iOS Safari) or prompt was deferred
    if (onOpenGuide) {
      onOpenGuide();
    }
  };

  const handleDismiss = () => {
    sounds.playClick();
    setHasDismissed(true);
    try {
      window.sessionStorage.setItem('gastosaurus_pwa_dismissed', '1');
    } catch {
      // Ignore storage restrictions
    }
  };

  return (
    <aside
      className="pwa-auto-banner liquid-glass-card animate-slide-up"
      role="banner"
      aria-label="Install Gastosaurus Web App"
    >
      <div className="pwa-banner-left">
        <div className="pwa-banner-icon-pill liquid-glass-subtle">
          <img src={mascotImg} alt="Gastosaurus" className="pwa-banner-mascot animate-float" />
        </div>
        <div className="pwa-banner-info">
          <div className="pwa-banner-title-row">
            <strong className="pwa-banner-title">Install Gastosaurus</strong>
            <span className="pwa-badge-pill">
              <Sparkles size={10} color="#E2486E" /> PWA
            </span>
          </div>
          <p className="pwa-banner-desc">
            {isIos
              ? 'Install to iPhone: Tap Share then Add to Home Screen'
              : 'Direct 1-tap install on your device • Instant load & offline'}
          </p>
        </div>
      </div>

      <div className="pwa-banner-actions">
        <button
          type="button"
          className="btn btn-primary pwa-banner-install-btn active-press"
          onClick={handleInstall}
          aria-label={isIos ? 'Show iOS install guide' : 'Install Gastosaurus app'}
        >
          {isIos ? <Share size={14} /> : <Download size={14} />}
          <span>{isIos ? 'How to Install' : 'Install App'}</span>
        </button>
        <button
          type="button"
          className="pwa-banner-close-btn active-press"
          onClick={handleDismiss}
          aria-label="Dismiss installation banner"
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};

export default PwaInstallBanner;
