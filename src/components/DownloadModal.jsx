import { useState } from 'react';
import mascotImg from '../assets/mascot.png';
import { sounds } from '../lib/sounds';
import { usePwaInstall } from '../hooks/usePwaInstall';
import {
  X,
  Download,
  Share,
  CheckCircle2,
  Sparkles
} from './CustomIcons';

export const DownloadModal = ({ isOpen, onClose }) => {
  const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [activePlatform, setActivePlatform] = useState(() => (isIos ? 'ios' : 'android'));
  const [installStatus, setInstallStatus] = useState('');
  const [showAddressBarCue, setShowAddressBarCue] = useState(false);
  const [isDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  });
  const [isInApp] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent || window.navigator.vendor || '';
    return /FBAN|FBAV|Instagram|Line|Twitter|ByteDance|TikTok/i.test(ua);
  });

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sounds.playClick();
    if (canInstall) {
      const res = await promptInstall();
      if (res?.accepted) {
        sounds.playSuccess();
        setInstallStatus('Installed successfully! Open Gastosaurus from your home screen or apps. 🦖');
        return;
      }
    }
    if (isIos) {
      setActivePlatform('ios');
      setInstallStatus('Follow the Safari steps below to add Gastosaurus to your home screen! 🦖');
    } else if (isDesktop) {
      setShowAddressBarCue(true);
      setInstallStatus('Look for the Install icon (⭳ or ⊕) in your browser’s address bar above to complete installation.');
    } else {
      setActivePlatform('android');
      setInstallStatus('Tap the menu button (⋮) in Chrome and choose "Install App" or "Add to Home screen".');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card download-modal-card liquid-glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        <button
          type="button"
          className="auth-close-btn active-press"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          aria-label="Close download modal"
        >
          <X size={16} />
        </button>

        <div className="download-modal-header">
          <div className="download-mascot-pill liquid-glass-subtle">
            <img src={mascotImg} alt="" className="download-mascot-img" />
          </div>
          <h2 id="download-modal-title" className="download-modal-title">
            Install <span className="hero-title-accent text-gradient-shimmer">Gastosaurus</span>
          </h2>
          <p className="download-modal-subtitle">
            Get the full native app experience right on your phone — instant load, full screen, zero app store hassle.
          </p>
        </div>

        {isInApp && (
          <div className="in-app-browser-warning liquid-glass-subtle">
            <span>⚠️ <strong>In-App Browser Detected:</strong> Tap your browser menu (⋮ or Share) and select <em>&quot;Open in Chrome&quot;</em> or <em>&quot;Open in Safari&quot;</em> to install the PWA.</span>
          </div>
        )}

        {/* Direct Install Action Box */}
        {!isInstalled && (
          <div className="direct-install-box liquid-glass-card active-press">
            <div className="direct-install-content">
              <Sparkles size={20} color="#E2486E" />
              <div>
                <strong>{canInstall ? '1-Tap Direct Install' : 'Install Gastosaurus'}</strong>
                <p>
                  {canInstall
                    ? 'Your browser is ready for 1-tap installation directly to your device.'
                    : isDesktop
                      ? 'Install Gastosaurus as a native standalone app on your desktop.'
                      : 'Add Gastosaurus directly to your home screen with zero app store hassle.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-install-now active-press"
              onClick={handleInstallClick}
            >
              <Download size={16} />
              <span>Install App</span>
            </button>
          </div>
        )}

        {/* Desktop Address Bar Helper Cue */}
        {showAddressBarCue && !isInstalled && (
          <div className="desktop-addressbar-cue liquid-glass-subtle animate-pop">
            <div className="addressbar-cue-badge">💡</div>
            <div className="addressbar-cue-content">
              <strong>Check your Browser Address Bar</strong>
              <p>Click the <strong>Install Gastosaurus</strong> icon (⭳ or ⊕) on the right side of the URL bar above to install immediately.</p>
            </div>
          </div>
        )}

        {isInstalled && (
          <div className="install-badge-success liquid-glass-subtle animate-pop">
            <CheckCircle2 size={18} color="#059669" />
            <span>Gastosaurus is already installed on this device!</span>
          </div>
        )}

        {installStatus && (
          <div className="install-badge-success liquid-glass-subtle animate-pop">
            <CheckCircle2 size={18} color="#059669" />
            <span>{installStatus}</span>
          </div>
        )}

        {/* Platform Instruction Switcher */}
        <div className="platform-nav-tabs liquid-glass-subtle">
          <button
            type="button"
            className={`platform-tab-btn active-press ${activePlatform === 'ios' ? 'active' : ''}`}
            onClick={() => {
              sounds.playPop();
              setActivePlatform('ios');
            }}
          >
            <span>iPhone / iPad (iOS)</span>
          </button>
          <button
            type="button"
            className={`platform-tab-btn active-press ${activePlatform === 'android' ? 'active' : ''}`}
            onClick={() => {
              sounds.playPop();
              setActivePlatform('android');
            }}
          >
            <span>Android / Chrome</span>
          </button>
        </div>

        {/* Platform Steps */}
        <div className="platform-steps-container">
          {activePlatform === 'ios' ? (
            <div className="platform-steps-list">
              <div className="pwa-step-item">
                <span className="step-number-circle">1</span>
                <div className="step-info">
                  <strong>Open in Safari</strong>
                  <p>Navigate to Gastosaurus using Apple Safari on your iPhone or iPad.</p>
                </div>
              </div>
              <div className="pwa-step-item">
                <span className="step-number-circle">2</span>
                <div className="step-info">
                  <strong>Tap Share</strong>
                  <p>Tap the <Share size={14} className="inline-step-icon" /> Share icon at the bottom of Safari.</p>
                </div>
              </div>
              <div className="pwa-step-item">
                <span className="step-number-circle">3</span>
                <div className="step-info">
                  <strong>Add to Home Screen</strong>
                  <p>Scroll down the share sheet and tap <em>&quot;Add to Home Screen&quot;</em>.</p>
                </div>
              </div>
              <div className="pwa-step-item">
                <span className="step-number-circle">4</span>
                <div className="step-info">
                  <strong>Launch with Zero Lag</strong>
                  <p>Tap <strong>Add</strong> in the top-right corner to place Gastosaurus on your home screen.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="platform-steps-list">
              <div className="pwa-step-item">
                <span className="step-number-circle">1</span>
                <div className="step-info">
                  <strong>Open in Chrome / Edge</strong>
                  <p>Open Gastosaurus in Google Chrome, Brave, or Samsung Internet.</p>
                </div>
              </div>
              <div className="pwa-step-item">
                <span className="step-number-circle">2</span>
                <div className="step-info">
                  <strong>Tap More (⋮)</strong>
                  <p>Tap the three-dot menu button in the top right corner of the browser.</p>
                </div>
              </div>
              <div className="pwa-step-item">
                <span className="step-number-circle">3</span>
                <div className="step-info">
                  <strong>Install or Add to Home Screen</strong>
                  <p>Select <em>&quot;Install app&quot;</em> or <em>&quot;Add to Home screen&quot;</em> from the menu list.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="download-modal-footer download-modal-footer-dual">
          <button
            type="button"
            className="btn btn-primary btn-install-app-main active-press"
            onClick={handleInstallClick}
          >
            <Download size={16} />
            <span>{isInstalled ? 'App Installed 🦖' : 'Install Gastosaurus'}</span>
          </button>
          <button
            type="button"
            className="btn btn-outline active-press"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
          >
            <span>Got it, thanks!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
