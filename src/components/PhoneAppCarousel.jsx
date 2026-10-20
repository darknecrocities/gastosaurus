import { useState } from 'react';
import mascotImg from '../assets/mascot.png';
import dinoRex from '../assets/dinos/dino-green-rex.png';
import dinoSpiky from '../assets/dinos/dino-pink-spiky.png';
import dinoTrike from '../assets/dinos/dino-teal-trike.png';
import dinoLongneck from '../assets/dinos/dino-purple-longneck.png';
import { sounds } from '../lib/sounds';
import {
  TrendingUp,
  CheckCircle2,
  Users,
  Calculator,
  Wallet,
  Sparkles,
  Copy
} from './CustomIcons';

// Screen 1: Itemized Ambagan
const ScreenAmbagan = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Itemized Ambagan</span>
    </div>
    <div className="mini-card-content">
      <div className="mini-badge-pink">Samgyup Night</div>
      <div className="mini-order-row">
        <span>Beef Brisket Set</span>
        <strong>₱1,200.00</strong>
      </div>
      <div className="mini-order-row">
        <span>Truffle Fries</span>
        <strong>₱380.00</strong>
      </div>
      <div className="mini-order-row">
        <span>2x Extra Rice</span>
        <strong>₱120.00</strong>
      </div>
      <div className="mini-avatars-row">
        <img src={dinoRex} alt="" className="tiny-dino" />
        <img src={dinoSpiky} alt="" className="tiny-dino" />
        <img src={dinoTrike} alt="" className="tiny-dino" />
        <span className="tiny-tag">+10% Service</span>
      </div>
    </div>
  </div>
);

// Screen 2: Verified GCash Receipt
const ScreenReceipt = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Settlement Proof</span>
    </div>
    <div className="mini-card-content text-center">
      <div className="mini-badge-green"><CheckCircle2 size={12} /> Confirmed</div>
      <div className="mini-big-amount text-gradient-shimmer">₱450.00</div>
      <p className="mini-subtext">Received by Alex via GCash</p>
      <div className="mini-ref-code">REF #GC-902184-PH</div>
      <span className="mini-confirmed-tag"><CheckCircle2 size={11} color="#059669" /> Zero Drama Verified</span>
    </div>
  </div>
);

// Screen 3: Dino Avatar Selection
const ScreenDinos = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Choose Persona</span>
    </div>
    <div className="mini-card-content">
      <div className="mini-badge-purple"><Sparkles size={11} /> 8 Personas</div>
      <div className="mini-dino-grid">
        <div className="mini-dino-cell selected"><img src={dinoRex} alt="" /><span>Rex</span></div>
        <div className="mini-dino-cell"><img src={dinoSpiky} alt="" /><span>Spiky</span></div>
        <div className="mini-dino-cell"><img src={dinoTrike} alt="" /><span>Trike</span></div>
        <div className="mini-dino-cell"><img src={dinoLongneck} alt="" /><span>Long</span></div>
      </div>
      <p className="mini-dino-role">Rex: The Tagasalo (Pays first)</p>
    </div>
  </div>
);

// Screen 4: Debt-Chain Minimizer Flow
const ScreenDebtFlow = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Debt Minimizer</span>
    </div>
    <div className="mini-card-content">
      <div className="mini-badge-purple"><TrendingUp size={11} /> N-1 Collapse</div>
      <div className="mini-flow-item">
        <span>Bea → Alex</span>
        <strong>₱450.00</strong>
      </div>
      <div className="mini-flow-item">
        <span>Miguel → Alex</span>
        <strong>₱520.00</strong>
      </div>
      <p className="mini-savings-callout">5 debts collapsed into 2 transfers</p>
    </div>
  </div>
);

// Screen 5: Quick Split Calculator
const ScreenCalculator = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Quick Split</span>
    </div>
    <div className="mini-card-content">
      <div className="mini-badge-pink"><Calculator size={11} /> Centavo Math</div>
      <div className="mini-bill-preview">₱1,320.00 Total</div>
      <div className="mini-pax-preview">4 Barkada Members</div>
      <div className="mini-split-result">
        <span>Each:</span>
        <strong>₱330.00</strong>
      </div>
    </div>
  </div>
);

// Screen 6: Boracay Barkada Feed
const ScreenGroupFeed = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Boracay 2026</span>
    </div>
    <div className="mini-card-content">
      <div className="mini-badge-blue"><Users size={11} /> 6 Dinos Active</div>
      <div className="mini-total-spent">₱18,450.00</div>
      <p className="mini-subtext">Total ambagan running balance</p>
      <div className="mini-sync-pill">● All Balances Settled</div>
    </div>
  </div>
);

// Screen 7: Personal Balance
const ScreenBalance = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Personal Net</span>
    </div>
    <div className="mini-card-content text-center">
      <div className="mini-badge-green"><Wallet size={11} /> You are owed</div>
      <div className="mini-big-amount text-green">₱1,450.00</div>
      <p className="mini-subtext">Across 3 active groups</p>
      <div className="mini-ready-btn">Request Settle Up</div>
    </div>
  </div>
);

// Screen 8: Group Join Code
const ScreenInvite = () => (
  <div className="tilted-phone-screen">
    <div className="mini-app-header">
      <img src={mascotImg} alt="" className="mini-header-logo" />
      <span>Invite Barkada</span>
    </div>
    <div className="mini-card-content text-center">
      <div className="mini-badge-pink"><Users size={11} /> Join Code</div>
      <div className="mini-code-box">GASTO-8821</div>
      <p className="mini-subtext">Share link with zero signup friction</p>
      <div className="mini-ready-btn"><Copy size={11} /> Copy Link</div>
    </div>
  </div>
);

const IPhoneMockup = ({ children, onClick }) => (
  <div className="tilted-phone-mockup active-press" onClick={onClick}>
    <div className="iphone-btn-side iphone-btn-action" />
    <div className="iphone-btn-side iphone-btn-volup" />
    <div className="iphone-btn-side iphone-btn-voldn" />
    <div className="iphone-btn-side iphone-btn-power" />
    <div className="iphone-inner-screen">
      <div className="iphone-speaker-slit" />
      <div className="iphone-status-bar">
        <span className="iphone-time">9:41</span>
        <div className="iphone-dynamic-island">
          <span className="iphone-island-lens" />
          <span className="iphone-island-sensor" />
        </div>
        <div className="iphone-status-icons">
          <span className="iphone-signal">
            <span className="sig-bar b1" />
            <span className="sig-bar b2" />
            <span className="sig-bar b3" />
            <span className="sig-bar b4" />
          </span>
          <span className="iphone-net">5G</span>
          <div className="iphone-battery">
            <div className="iphone-battery-fill" />
            <div className="iphone-battery-tip" />
          </div>
        </div>
      </div>
      {children}
      <div className="iphone-home-indicator-wrapper">
        <div className="iphone-home-indicator-pill" />
      </div>
    </div>
  </div>
);

const COLUMN_1_SCREENS = [ScreenAmbagan, ScreenReceipt, ScreenDinos];
const COLUMN_2_SCREENS = [ScreenDebtFlow, ScreenCalculator, ScreenGroupFeed];
const COLUMN_3_SCREENS = [ScreenBalance, ScreenInvite, ScreenAmbagan];
const COLUMN_4_SCREENS = [ScreenReceipt, ScreenDinos, ScreenDebtFlow];
const COLUMN_5_SCREENS = [ScreenCalculator, ScreenGroupFeed, ScreenBalance];

export const PhoneAppCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate for seamless infinite loop
  const col1 = [...COLUMN_1_SCREENS, ...COLUMN_1_SCREENS];
  const col2 = [...COLUMN_2_SCREENS, ...COLUMN_2_SCREENS];
  const col3 = [...COLUMN_3_SCREENS, ...COLUMN_3_SCREENS];
  const col4 = [...COLUMN_4_SCREENS, ...COLUMN_4_SCREENS];
  const col5 = [...COLUMN_5_SCREENS, ...COLUMN_5_SCREENS];

  return (
    <section id="showcase" className="tilted-showcase-section">
      {/* Whole-Section Ambient Streaming Phone Matrix Background */}
      <div
        className="tilted-streams-canvas-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-hidden="true"
      >
        <div className={`tilted-streams-canvas ${isPaused ? 'paused' : ''}`}>
          {/* Stream Column 1: Upward */}
          <div className="tilted-stream-col col-stream-up">
            {col1.map((ScreenComponent, idx) => (
              <IPhoneMockup key={`col1-${idx}`} onClick={() => sounds.playPop()}>
                <ScreenComponent />
              </IPhoneMockup>
            ))}
          </div>

          {/* Stream Column 2: Downward */}
          <div className="tilted-stream-col col-stream-down">
            {col2.map((ScreenComponent, idx) => (
              <IPhoneMockup key={`col2-${idx}`} onClick={() => sounds.playPop()}>
                <ScreenComponent />
              </IPhoneMockup>
            ))}
          </div>

          {/* Stream Column 3: Upward */}
          <div className="tilted-stream-col col-stream-up-alt">
            {col3.map((ScreenComponent, idx) => (
              <IPhoneMockup key={`col3-${idx}`} onClick={() => sounds.playPop()}>
                <ScreenComponent />
              </IPhoneMockup>
            ))}
          </div>

          {/* Stream Column 4: Downward */}
          <div className="tilted-stream-col col-stream-down-alt">
            {col4.map((ScreenComponent, idx) => (
              <IPhoneMockup key={`col4-${idx}`} onClick={() => sounds.playPop()}>
                <ScreenComponent />
              </IPhoneMockup>
            ))}
          </div>

          {/* Stream Column 5: Upward */}
          <div className="tilted-stream-col col-stream-up-alt2">
            {col5.map((ScreenComponent, idx) => (
              <IPhoneMockup key={`col5-${idx}`} onClick={() => sounds.playPop()}>
                <ScreenComponent />
              </IPhoneMockup>
            ))}
          </div>
        </div>
      </div>

      {/* Foreground Content */}
      <div className="tilted-showcase-inner">
        <div className="tilted-showcase-intro">
          <h2 className="tilted-showcase-title">
            MOBILE APP <br />
            <span className="text-stroke-hollow">DESIGN</span> <br />
            <span className="hero-title-accent text-gradient-shimmer">SYSTEM.</span>
          </h2>

          <p className="tilted-showcase-desc">
            Engineered specifically for barkadas. Responsive, itemized, and auto-balanced in real-time on every device.
          </p>

          <div className="tilted-features-mini-list">
            <div className="tilted-feat-item">
              <span className="feat-check"><CheckCircle2 size={15} color="#E2486E" /></span>
              <span>1-tap itemized dish assignment</span>
            </div>
            <div className="tilted-feat-item">
              <span className="feat-check"><CheckCircle2 size={15} color="#E2486E" /></span>
              <span>Direct GCash & Maya transfer collapse</span>
            </div>
            <div className="tilted-feat-item">
              <span className="feat-check"><CheckCircle2 size={15} color="#E2486E" /></span>
              <span>Zero-download PWA install on iOS & Android</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhoneAppCarousel;
