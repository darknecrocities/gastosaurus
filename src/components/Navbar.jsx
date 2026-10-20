import { useState } from 'react';
import mascotImg from '../assets/mascot.png';
import { Bell, LogOut, Volume2, VolumeX, Download } from './CustomIcons';
import Avatar from './Avatar';
import { sounds } from '../lib/sounds';

const TABS = [
  { id: 'dashboard', label: 'Home' },
  { id: 'groups', label: 'Groups' },
  { id: 'settlements', label: 'Settlements' },
];

/** The pill switcher between Home, Groups and Settlements (top bar on desktop, own row on mobile). */
const TabSwitcher = ({ currentTab, onSelectTab, className = '', label }) => (
  <nav className={`nav-pill-wrapper ${className}`} aria-label={label}>
    <div className="nav-pill-track liquid-glass-subtle">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`nav-pill-btn active-press ${isActive ? 'active' : ''}`}
            onClick={() => {
              sounds.playPop();
              onSelectTab(tab.id);
            }}
            aria-current={isActive ? 'page' : undefined}
            id={`nav-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  </nav>
);

export const Navbar = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  unreadCount = 0,
  onOpenNotifs,
  authUser,
  userName,
  onOpenProfileModal,
  onLogout,
  onOpenDownload,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(() => sounds.isEnabled());
  const currentPerson = authUser || (userName ? { name: userName } : null);

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setIsAudioActive(next);
  };

  return (
    <header className="gastosaurus-navbar-container liquid-glass-subtle">
      <div className="navbar-content">
        <button
          type="button"
          className="navbar-brand active-press"
          onClick={() => {
            sounds.playChomp();
            onNavigateHome();
          }}
          title="Go home"
        >
          <span className="mascot-avatar-wrapper liquid-glass-subtle">
            <img src={mascotImg} alt="" className="mascot-avatar-img" />
          </span>
          <span className="brand-name">Gastosaurus</span>
        </button>

        <TabSwitcher currentTab={currentTab} onSelectTab={onSelectTab} className="desktop-only" label="Main navigation" />

        <div className="navbar-actions">
          {/* Sound Toggle Button */}
          <button
            type="button"
            className="sound-toggle-nav-btn active-press"
            onClick={handleToggleSound}
            aria-label={isAudioActive ? 'Mute sound effects' : 'Enable sound effects'}
            title={isAudioActive ? 'Sound is ON' : 'Sound is OFF'}
          >
            {isAudioActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Download App / PWA Button */}
          {onOpenDownload && (
            <button
              type="button"
              className="navbar-download-btn liquid-glass-subtle active-press"
              onClick={() => {
                sounds.playClick();
                onOpenDownload();
              }}
              title="Install Gastosaurus on your device"
              aria-label="Download app"
            >
              <Download size={16} />
              <span className="navbar-download-label">App</span>
            </button>
          )}

          {currentPerson && onOpenProfileModal && (
            <button
              type="button"
              className="navbar-profile-pill liquid-glass-card active-press"
              id="navbar-profile-btn"
              onClick={() => {
                sounds.playClick();
                onOpenProfileModal();
              }}
              title={`Logged in as ${currentPerson.name} · Customize your Dino avatar`}
              aria-label="Customize your Dino avatar"
            >
              <Avatar person={currentPerson} className="navbar-dino-avatar" size={30} />
              <span className="navbar-profile-name">{currentPerson.name}</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              className="btn btn-outline navbar-logout-btn active-press"
              onClick={() => {
                sounds.playClick();
                onLogout();
              }}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} className="navbar-logout-icon" />
              <span className="navbar-logout-label">Log out</span>
            </button>
          )}

          <button
            type="button"
            className="icon-btn active-press"
            onClick={() => {
              sounds.playClick();
              onOpenNotifs?.();
            }}
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
            title="Notifications"
            id="navbar-notif-btn"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="icon-btn-dot" />}
          </button>
        </div>
      </div>

      <TabSwitcher currentTab={currentTab} onSelectTab={onSelectTab} className="mobile-pill-container mobile-only" label="Main navigation" />
    </header>
  );
};

export default Navbar;
