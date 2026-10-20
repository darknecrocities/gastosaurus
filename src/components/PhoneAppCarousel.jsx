import { useState } from 'react';
import mascotImg from '../assets/mascot.png';
import dinoRex from '../assets/dinos/dino-green-rex.png';
import dinoSpiky from '../assets/dinos/dino-pink-spiky.png';
import dinoTrike from '../assets/dinos/dino-teal-trike.png';
import dinoLongneck from '../assets/dinos/dino-purple-longneck.png';
import {
  ReceiptText,
  TrendingUp,
  CheckCircle2,
  Users,
  Smartphone
} from './CustomIcons';

const PHONE_CAROUSEL_ROWS = [
  {
    id: 'row-ambagan',
    badge: 'Itemized Ambagan',
    title: 'Samgyupsal Night Breakdown',
    subtitle: 'Pay only for what you ate with exact centavo math',
    icon: ReceiptText,
    accentColor: '#E2486E',
    items: [
      { name: 'Beef Brisket Set', cost: '₱1,200.00', assigned: [dinoRex, dinoSpiky, dinoTrike, dinoLongneck] },
      { name: 'Truffle Fries', cost: '₱380.00', assigned: [dinoSpiky, dinoTrike] },
      { name: '2x Extra Rice', cost: '₱120.00', assigned: [dinoRex] },
      { name: '+10% Service Charge', cost: 'Apportioned', assigned: [] },
    ],
  },
  {
    id: 'row-settle',
    badge: 'Debt-Chain Minimizer',
    title: 'Smart Settlement Flow',
    subtitle: 'N-1 transfers: no awkward multi-way IOU circles',
    icon: TrendingUp,
    accentColor: '#5B3A84',
    transfers: [
      { from: 'Bea', to: 'Alex', amount: '₱450.00', note: 'Via GCash' },
      { from: 'Miguel', to: 'Alex', amount: '₱520.00', note: 'Via Maya' },
    ],
    savingsLabel: 'Collapsed 5 multi-way payments down to 2 direct transfers',
  },
  {
    id: 'row-groups',
    badge: 'Barkada Group Sync',
    title: 'Boracay Roadtrip 2026',
    subtitle: '6 active dinos · Running ambagan total ₱18,450',
    icon: Users,
    accentColor: '#2563EB',
    stats: [
      { label: 'Total Ambang', val: '₱18,450' },
      { label: 'Unsettled', val: '₱970' },
      { label: 'Status', val: 'In Sync' },
    ],
  },
  {
    id: 'row-confirm',
    badge: 'Receiver Confirmation',
    title: 'Verified Settle-Up Receipt',
    subtitle: 'Receiver confirms each payment to prevent lost receipts',
    icon: CheckCircle2,
    accentColor: '#059669',
    confirmation: {
      payer: 'Bea',
      receiver: 'Alex',
      amount: '₱450.00',
      refCode: 'GC-902184-PH',
      status: 'Confirmed by Alex ✅',
    },
  },
];

export const PhoneAppCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate rows for smooth seamless infinite vertical loop
  const displayRows = [...PHONE_CAROUSEL_ROWS, ...PHONE_CAROUSEL_ROWS];

  return (
    <section className="phone-showcase-section">
      <div className="phone-showcase-header">
        <div className="section-pill liquid-glass-subtle">
          <Smartphone size={15} color="#E2486E" />
          <span>Non-Stop Live Preview</span>
        </div>
        <h2 className="section-title">
          Experience Gastosaurus on <span className="hero-title-accent text-gradient-shimmer">Every Screen</span>
        </h2>
        <p className="section-subtitle">
          Watch bills auto-balance, itemized orders compute, and debt chains collapse in real-time.
        </p>
      </div>

      <div className="phone-frame-container">
        {/* Realistic iPhone Style Mockup Frame */}
        <div
          className="phone-mockup-outer liquid-glass-card"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top Speaker / Dynamic Island */}
          <div className="phone-island">
            <div className="island-camera" />
            <div className="island-speaker" />
          </div>

          {/* App Header Bar Inside Phone */}
          <div className="phone-screen-header liquid-glass-subtle">
            <div className="phone-app-brand">
              <img src={mascotImg} alt="" className="phone-brand-avatar" />
              <span>Gastosaurus</span>
            </div>
            <span className="phone-status-pill">Live Sync</span>
          </div>

          {/* 4-Row Infinite Vertical Looping Track */}
          <div className="phone-carousel-viewport">
            <div
              className={`phone-carousel-track ${isPaused ? 'paused' : ''}`}
            >
              {displayRows.map((row, index) => {
                const IconComponent = row.icon;
                return (
                  <div key={`${row.id}-${index}`} className="phone-carousel-card liquid-glass-card">
                    <div className="phone-card-top">
                      <span className="phone-card-badge" style={{ color: row.accentColor }}>
                        <IconComponent size={13} />
                        <span>{row.badge}</span>
                      </span>
                    </div>

                    <h4 className="phone-card-title">{row.title}</h4>
                    <p className="phone-card-subtitle">{row.subtitle}</p>

                    {/* Row 1: Itemized Ambagan */}
                    {row.items && (
                      <div className="phone-items-mini-list">
                        {row.items.map((item, idx) => (
                          <div key={idx} className="phone-item-row">
                            <span className="phone-item-name">{item.name}</span>
                            <div className="phone-item-meta">
                              {item.assigned.length > 0 && (
                                <div className="phone-item-avatars">
                                  {item.assigned.map((avatar, aIdx) => (
                                    <img key={aIdx} src={avatar} alt="" className="mini-avatar-dino" />
                                  ))}
                                </div>
                              )}
                              <span className="phone-item-cost">{item.cost}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Row 2: Debt-Chain Transfers */}
                    {row.transfers && (
                      <div className="phone-transfers-mini-list">
                        {row.transfers.map((t, idx) => (
                          <div key={idx} className="phone-transfer-row liquid-glass-subtle">
                            <div className="transfer-direction">
                              <span className="transfer-person">{t.from}</span>
                              <span className="transfer-arrow">→</span>
                              <span className="transfer-person">{t.to}</span>
                            </div>
                            <span className="transfer-amount">{t.amount}</span>
                          </div>
                        ))}
                        <p className="phone-savings-note">{row.savingsLabel}</p>
                      </div>
                    )}

                    {/* Row 3: Barkada Group Summary */}
                    {row.stats && (
                      <div className="phone-stats-grid">
                        {row.stats.map((s, idx) => (
                          <div key={idx} className="phone-stat-box liquid-glass-subtle">
                            <span className="stat-label">{s.label}</span>
                            <span className="stat-val">{s.val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Row 4: Confirmed Receipt */}
                    {row.confirmation && (
                      <div className="phone-receipt-box liquid-glass-subtle">
                        <div className="receipt-row">
                          <span>Payment:</span>
                          <strong>{row.confirmation.amount}</strong>
                        </div>
                        <div className="receipt-row">
                          <span>Reference:</span>
                          <code>{row.confirmation.refCode}</code>
                        </div>
                        <div className="receipt-status-confirmed">
                          <CheckCircle2 size={14} color="#059669" />
                          <span>{row.confirmation.status}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Home Indicator */}
          <div className="phone-home-indicator" />
        </div>
      </div>
    </section>
  );
};

export default PhoneAppCarousel;
