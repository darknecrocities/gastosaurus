import { useState, useRef, useEffect } from 'react';
import mascotImg from '../assets/mascot.png';
import { ArrowRight, Delete, Plus, CheckCircle2, ChevronDown } from './CustomIcons';
import PageHeader from './PageHeader';
import Avatar from './Avatar';
import { groupsApi } from '../lib/api';
import { useAsync } from '../hooks/useAsync';

/**
 * Step 1 of adding an expense: type an amount, name the item, pick who it's for.
 * Continue hands { name, price, memberIds } to the item-split screen, where more
 * items can be added before saving.
 */
export const AddExpenseCalculatorView = ({
  groups = [],
  groupId,
  onChangeGroup,
  onBack,
  initialPaidBy = null,
  onContinue,
  onCancel,
}) => {
  // Keypad display state (string representation of number)
  const [amountStr, setAmountStr] = useState('0.00');
  const [itemName, setItemName] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const amountInputRef = useRef(null);

  // The group's members; everyone starts selected ("For Whom?").
  const { data, reload } = useAsync(() => groupsApi.get(groupId), [groupId]);
  const groupMembers = data?.members ?? [];
  const [deselected, setDeselected] = useState(() => new Set());
  const members = groupMembers.map((m) => ({ ...m, selected: !deselected.has(m.id) }));

  // "Paid By": one member. Defaults to the current user (or whoever paid last time
  // on this draft); falls back safely if the chosen id isn't in this group.
  const [paidById, setPaidById] = useState(initialPaidBy);
  const me = groupMembers.find((m) => m.isCurrentUser);
  const paidBy = groupMembers.find((m) => m.id === paidById)?.id ?? me?.id ?? groupMembers[0]?.id ?? null;

  // Inline "add a friend" form (creates a guest member in the group)
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [isSavingPerson, setIsSavingPerson] = useState(false);

  const flash = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle on-screen calculator keypad press
  const handleKeyPress = (key) => {
    setAmountStr((prev) => {
      // Backspace
      if (key === 'backspace') {
        if (prev.length <= 1 || prev === '0.00' || prev === '0') {
          return '0.00';
        }
        if (prev === '0.00') return '0.00';
        
        const next = prev.slice(0, -1);
        return next === '' || next === '.' ? '0.00' : next;
      }

      // If current is default '0.00', start fresh unless typing '.'
      if (prev === '0.00' || prev === '0') {
        if (key === '.') return '0.';
        return key;
      }

      // Decimal point handling
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }

      // Prevent more than 2 decimal places
      if (prev.includes('.')) {
        const parts = prev.split('.');
        if (parts[1] && parts[1].length >= 2) return prev;
      }

      // Limit length
      if (prev.length >= 8) return prev;

      return prev + key;
    });
  };

  // Handle direct keyboard typing in amount input
  const handleAmountInputChange = (e) => {
    let rawVal = e.target.value;
    // Keep only numbers and single decimal point
    rawVal = rawVal.replace(/[^0-9.]/g, '');

    const parts = rawVal.split('.');
    if (parts.length > 2) {
      rawVal = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      rawVal = parts[0] + '.' + parts[1].slice(0, 2);
    }
    if (rawVal.length > 9) {
      rawVal = rawVal.slice(0, 9);
    }

    setAmountStr(rawVal === '' ? '0' : rawVal);
  };

  // Handle amount blur formatting
  const handleAmountBlur = () => {
    if (!amountStr || amountStr === '' || amountStr === '.' || amountStr === '0') {
      setAmountStr('0.00');
    } else {
      const num = parseFloat(amountStr);
      if (!isNaN(num) && !amountStr.includes('.')) {
        setAmountStr(num.toFixed(2));
      }
    }
  };

  // Focus input when user clicks on total amount box
  const handleAmountBoxClick = () => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
      if (amountStr === '0.00' || amountStr === '0') {
        amountInputRef.current.select();
      }
    }
  };

  // Global physical keyboard listener when not typing in other inputs
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // If user is focused on another input (like item name), don't intercept
      const activeEl = document.activeElement;
      if (activeEl && activeEl !== amountInputRef.current && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (activeEl !== amountInputRef.current) {
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
          e.preventDefault();
          handleKeyPress(e.key);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          handleKeyPress('backspace');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [amountStr]);

  const toggleMember = (id) => {
    setDeselected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allSelected = members.every((m) => m.selected);
    setDeselected(allSelected ? new Set(members.map((m) => m.id)) : new Set());
  };

  // Add a friend to the group as a guest (no account needed).
  const handleAddNewMember = async (e) => {
    e.preventDefault();
    const name = newPersonName.trim();
    if (!name) return;
    setIsSavingPerson(true);
    try {
      await groupsApi.addMember(groupId, { name });
      await reload();
      setNewPersonName('');
      setIsAddingPerson(false);
      flash(`Added ${name} to the group ✨`);
    } catch (err) {
      flash(err.message);
    } finally {
      setIsSavingPerson(false);
    }
  };

  const parsedAmount = Math.round((parseFloat(amountStr) || 0) * 100) / 100;

  const handleContinue = () => {
    const selectedList = members.filter((m) => m.selected);
    if (parsedAmount <= 0) return flash('Enter how much it cost first.');
    if (selectedList.length === 0) return flash('Please select at least one person for this expense.');
    return onContinue(
      { name: itemName.trim() || 'Expense', price: parsedAmount, memberIds: selectedList.map((m) => m.id) },
      groupMembers,
      paidBy,
    );
  };

  return (
    <div className="add-expense-calculator-page animate-fade-in">
      <PageHeader
        title="Add Expenses"
        action={
          onCancel && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} id="btn-cancel-expense">
              Cancel
            </button>
          )
        }
        onBack={onBack}
        backId="btn-back-from-calculator"
      />

      {/* Main Content Area with Center Mascot Watermark */}
      <div className="calc-main-container">
        {/* Background Mascot Watermark Illustration */}
        <div className="calc-mascot-watermark" aria-hidden="true">
          <img src={mascotImg} alt="" className="watermark-img" />
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="banner banner-success calc-toast-banner animate-fade-in">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="calc-grid-wrapper">
          {/* Left Column: Total Amount + Keypad + What Item */}
          <div className="calc-left-col">
            <div 
              className="calc-amount-display-box" 
              onClick={handleAmountBoxClick}
              title="Click to type with keyboard or use keypad below"
            >
              <span className="calc-amount-label">Total Amount</span>
              <div className="calc-amount-value">
                <span className="peso-sign">₱</span>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={handleAmountInputChange}
                  onBlur={handleAmountBlur}
                  onFocus={(e) => {
                    if (amountStr === '0.00' || amountStr === '0') {
                      e.target.select();
                    }
                  }}
                  className="calc-amount-number-input"
                  id="input-total-amount-display"
                  aria-label="Total Amount"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* 4x3 Calculator Keypad */}
            <div className="calc-keypad-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className="calc-key-btn"
                  onClick={() => handleKeyPress(val)}
                  id={`calc-key-${val === '.' ? 'dot' : val}`}
                >
                  {val}
                </button>
              ))}

              {/* Backspace Key */}
              <button
                type="button"
                className="calc-key-btn key-backspace"
                onClick={() => handleKeyPress('backspace')}
                aria-label="Delete last digit"
                id="calc-key-backspace"
              >
                <Delete size={22} strokeWidth={2.2} />
              </button>
            </div>

            {/* What Item Input */}
            <div className="calc-item-input-box">
              <input
                type="text"
                placeholder="What Item?"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="calc-item-name-input"
                id="input-calc-item-name"
              />
            </div>
          </div>

          {/* Right Column: group picker, then two boxes — For Whom? and Paid By */}
          <div className="calc-right-col">
            {groups.length > 1 && (
              <div className="custom-select-wrapper">
                <select
                  className="form-select custom-select-input"
                  value={groupId}
                  onChange={(e) => onChangeGroup(e.target.value)}
                  aria-label="Group"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <div className="custom-select-arrow" aria-hidden="true">
                  <ChevronDown size={18} strokeWidth={2.2} />
                </div>
              </div>
            )}

            <div className="calc-boxes-row">
              {/* Box 1 — For Whom? */}
              <div className="for-whom-card" id="box-for-whom">
                <div className="for-whom-header">
                  <h3 className="for-whom-title">For Whom?</h3>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleSelectAll}
                    id="btn-select-all-members"
                  >
                    {members.every(m => m.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Avatars Row */}
                <div className="for-whom-avatars-row">
                  {members.map((mem) => (
                    <div
                      key={mem.id}
                      className={`for-whom-avatar-item ${mem.selected ? 'selected' : 'unselected'}`}
                      onClick={() => toggleMember(mem.id)}
                      role="checkbox"
                      aria-checked={mem.selected}
                      tabIndex={0}
                      id={`avatar-item-${mem.id}`}
                    >
                      <div className="avatar-circle-wrapper">
                        <Avatar person={mem} className="avatar-face-img" />
                        {mem.selected && (
                          <div className="avatar-active-ring" />
                        )}
                      </div>
                      <span className="avatar-person-label">{mem.isCurrentUser ? 'You' : mem.name}</span>
                    </div>
                  ))}

                  {/* + Add New Person Button */}
                  <div
                    className="for-whom-avatar-item add-new"
                    onClick={() => setIsAddingPerson(true)}
                    role="button"
                    tabIndex={0}
                    id="btn-add-for-whom-person"
                  >
                    <div className="avatar-add-circle">
                      <Plus size={20} strokeWidth={2.4} />
                    </div>
                    <span className="avatar-person-label">Add</span>
                  </div>
                </div>

                {/* Inline Add Person Form */}
                {isAddingPerson && (
                  <form onSubmit={handleAddNewMember} className="inline-add-person-form animate-fade-in">
                    <input
                      type="text"
                      placeholder="Friend's name..."
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      className="inline-person-input"
                      autoFocus
                    />
                    <div className="inline-form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={isSavingPerson}>
                        {isSavingPerson ? 'Adding…' : 'Add'}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAddingPerson(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>

              {/* Box 2 — Paid By (pick one) */}
              <div className="for-whom-card paid-by-card" id="box-paid-by">
                <div className="for-whom-header">
                  <h3 className="for-whom-title">Paid By</h3>
                </div>

                <div className="for-whom-avatars-row" role="radiogroup" aria-label="Paid by">
                  {groupMembers.map((mem) => {
                    const isPayer = mem.id === paidBy;
                    return (
                      <div
                        key={mem.id}
                        className={`for-whom-avatar-item ${isPayer ? 'selected' : 'unselected'}`}
                        onClick={() => setPaidById(mem.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPaidById(mem.id);
                          }
                        }}
                        role="radio"
                        aria-checked={isPayer}
                        tabIndex={0}
                        id={`paid-by-item-${mem.id}`}
                      >
                        <div className="avatar-circle-wrapper">
                          <Avatar person={mem} className="avatar-face-img" />
                          {isPayer && <div className="avatar-active-ring" />}
                        </div>
                        <span className="avatar-person-label">{mem.isCurrentUser ? 'You' : mem.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Continue Button */}
        <div className="calc-bottom-action-bar">
          <button
            type="button"
            className="btn btn-primary btn-lg btn-mobile-block"
            onClick={handleContinue}
            id="btn-calc-continue-action"
          >
            <span>Continue</span>
            <ArrowRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseCalculatorView;
