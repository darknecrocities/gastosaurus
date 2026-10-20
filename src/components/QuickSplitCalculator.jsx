import { useState, useMemo } from 'react';
import { sounds } from '../lib/sounds';
import { Users, Calculator, ArrowRight, Zap } from './CustomIcons';
import { peso } from '../lib/format';

export const QuickSplitCalculator = ({ onStartSaving }) => {
  const [totalAmount, setTotalAmount] = useState(1200);
  const [peopleCount, setPeopleCount] = useState(4);
  const [serviceCharge, setServiceCharge] = useState(false); // +10%

  const math = useMemo(() => {
    const rawTotal = Math.max(0, Number(totalAmount) || 0);
    const charge = serviceCharge ? rawTotal * 0.10 : 0;
    const finalTotal = rawTotal + charge;
    const count = Math.max(1, peopleCount);
    const perPerson = finalTotal / count;
    return {
      finalTotal,
      charge,
      perPerson,
      evenSplitCentavos: Math.round(perPerson * 100),
    };
  }, [totalAmount, peopleCount, serviceCharge]);

  const adjustPeople = (delta) => {
    sounds.playClick();
    setPeopleCount((prev) => Math.max(2, Math.min(20, prev + delta)));
  };

  const toggleCharge = () => {
    sounds.playPop();
    setServiceCharge((prev) => !prev);
  };

  return (
    <div className="quick-split-widget liquid-glass-card">
      <div className="quick-split-header">
        <div className="quick-split-icon-wrap">
          <Calculator size={18} className="quick-split-icon" />
        </div>
        <div>
          <h3 className="quick-split-title">Quick Ambagan Calculator</h3>
          <p className="quick-split-subtitle">Instant breakdown before you even sign up</p>
        </div>
      </div>

      <div className="quick-split-body">
        {/* Bill Total Input */}
        <div className="calc-field-group">
          <label htmlFor="quick-calc-bill" className="calc-label">Total Bill Amount</label>
          <div className="calc-input-wrapper liquid-glass-subtle">
            <span className="calc-currency">₱</span>
            <input
              id="quick-calc-bill"
              type="number"
              min="0"
              step="10"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
              className="calc-input"
            />
          </div>
        </div>

        {/* Headcount Stepper */}
        <div className="calc-row-controls">
          <div className="calc-field-group flex-1">
            <span className="calc-label">Number of Barkada</span>
            <div className="headcount-stepper liquid-glass-subtle">
              <button
                type="button"
                className="stepper-btn active-press"
                onClick={() => adjustPeople(-1)}
                disabled={peopleCount <= 2}
                aria-label="Decrease headcount"
              >
                −
              </button>
              <div className="stepper-value">
                <Users size={16} className="stepper-icon" />
                <span>{peopleCount}</span>
              </div>
              <button
                type="button"
                className="stepper-btn active-press"
                onClick={() => adjustPeople(1)}
                disabled={peopleCount >= 20}
                aria-label="Increase headcount"
              >
                +
              </button>
            </div>
          </div>

          {/* Service Charge Toggle Pill */}
          <div className="calc-field-group">
            <span className="calc-label">Add 10% Service</span>
            <button
              type="button"
              className={`calc-toggle-chip active-press ${serviceCharge ? 'active' : ''}`}
              onClick={toggleCharge}
              aria-pressed={serviceCharge}
            >
              <Zap size={14} />
              <span>{serviceCharge ? '+10% Added' : 'No Service'}</span>
            </button>
          </div>
        </div>

        {/* Result Highlight Card */}
        <div className="calc-result-box liquid-glass-subtle">
          <div className="calc-result-left">
            <span className="calc-result-label">Each Person Pays</span>
            <div className="calc-result-amount text-gradient-shimmer">
              {peso(math.perPerson)}
            </div>
            <span className="calc-result-hint">
              Total {peso(math.finalTotal)} {serviceCharge ? '(incl. 10% charge)' : ''}
            </span>
          </div>

          {onStartSaving && (
            <button
              type="button"
              className="btn btn-primary btn-sm calc-cta-btn active-press"
              onClick={() => {
                sounds.playClick();
                onStartSaving();
              }}
            >
              <span>Split for Real</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSplitCalculator;
