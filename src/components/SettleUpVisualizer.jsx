import { useState } from 'react';
import { sounds } from '../lib/sounds';
import { ArrowRight, CheckCircle2, RefreshCw } from './CustomIcons';

const SCENARIOS = [
  {
    title: 'Samgyupsal Night (3 Friends)',
    problem: 'Alex paid ₱1,500. Bea and Miguel owe ₱500 each to Alex.',
    withoutGastosaurus: 'Bea transfers to Alex, Miguel transfers to Alex (2 payments).',
    withGastosaurus: '1 auto-balanced settlement list. Zero confusion, 0% sama ng loob.',
    steps: [
      { from: 'Bea', to: 'Alex', amount: '₱500' },
      { from: 'Miguel', to: 'Alex', amount: '₱500' },
    ],
  },
  {
    title: 'Boracay Trip Debt Chain',
    problem: 'Carlo owes Bea ₱800. Bea owes Sarah ₱800.',
    withoutGastosaurus: 'Carlo pays Bea, then Bea waits and pays Sarah (2 slow transactions).',
    withGastosaurus: 'Gastosaurus collapses the chain: Carlo pays Sarah ₱800 directly (1 payment)!',
    steps: [
      { from: 'Carlo', to: 'Sarah', amount: '₱800 (Direct)' },
    ],
  },
];

export const SettleUpVisualizer = () => {
  const [index, setIndex] = useState(0);
  const scenario = SCENARIOS[index];

  const handleNext = () => {
    sounds.playPop();
    setIndex((prev) => (prev + 1) % SCENARIOS.length);
  };

  return (
    <div className="settle-visualizer-widget liquid-glass-card">
      <div className="visualizer-header">
        <div className="visualizer-title-wrap">
          <span className="visualizer-badge">Debt-Chain Minimizer</span>
          <h3 className="visualizer-title">{scenario.title}</h3>
        </div>
        <button
          type="button"
          className="visualizer-refresh-btn active-press"
          onClick={handleNext}
          title="Switch scenario"
          aria-label="Switch scenario"
        >
          <RefreshCw size={14} />
          <span>Next Story</span>
        </button>
      </div>

      <div className="visualizer-body">
        <p className="visualizer-desc">{scenario.problem}</p>

        {/* Comparison Diagram */}
        <div className="visualizer-flows">
          <div className="flow-card flow-old liquid-glass-subtle">
            <span className="flow-tag tag-old">Without Gastosaurus</span>
            <p className="flow-text">{scenario.withoutGastosaurus}</p>
          </div>

          <div className="flow-card flow-smart liquid-glass-card">
            <span className="flow-tag tag-smart">
              <CheckCircle2 size={12} />
              With Gastosaurus
            </span>
            <div className="flow-steps">
              {scenario.steps.map((st, i) => (
                <div key={i} className="settle-chain-item">
                  <span className="chain-node node-from">{st.from}</span>
                  <div className="chain-arrow-wrap">
                    <span className="chain-amount">{st.amount}</span>
                    <ArrowRight size={14} className="chain-arrow" />
                  </div>
                  <span className="chain-node node-to">{st.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettleUpVisualizer;
