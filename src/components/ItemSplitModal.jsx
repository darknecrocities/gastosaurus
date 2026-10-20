import { Users, X, Check } from './CustomIcons';
import Avatar from './Avatar';
import { peso } from '../lib/format';

export const ItemSplitModal = ({
  splitModal,
  splitItem,
  items,
  members,
  nameOf,
  onClose,
  onChangeItem,
  onToggleMember,
  onConfirm,
}) => {
  if (!splitModal || !splitItem) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card split-item-modal-card liquid-glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="modal-icon-badge" style={{ backgroundColor: '#F3E8FF' }}>
              <Users size={20} color="#7C3AED" />
            </div>
            <div>
              <h3 className="modal-title-heading">Split Item with Squad</h3>
              <span className="modal-sub">Divide this item evenly among selected friends</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body split-modal-body">
          <div className="form-group">
            <label className="form-label">Select Item to Split</label>
            <div className="custom-select-wrapper">
              <select
                value={splitModal.itemId}
                onChange={(e) => onChangeItem(e.target.value)}
                className="form-select custom-select-input liquid-glass-subtle"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {peso(item.price)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Split Among ({splitModal.memberIds.length} selected)</label>
            <div className="split-members-picker-row">
              {members.map((m) => {
                const isSelected = splitModal.memberIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`split-member-pill-btn liquid-glass-subtle ${isSelected ? 'selected' : ''}`}
                    onClick={() => onToggleMember(m.id)}
                  >
                    <Avatar person={m} className="split-member-avatar-circle" />
                    <span className="split-member-name">{nameOf[m.id]}</span>
                    {isSelected && <Check size={14} color="#7C3AED" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="split-preview-summary-box liquid-glass-subtle">
            <div className="split-preview-header">
              <span className="split-preview-item-name">{splitItem.name}</span>
              <span className="split-preview-item-total">Total: {peso(splitItem.price)}</span>
            </div>
            <div className="split-preview-calc-row">
              <span className="split-calc-math">
                {peso(splitItem.price)} ÷ {splitModal.memberIds.length} {splitModal.memberIds.length > 1 ? 'people' : 'person'}
              </span>
              <span className="split-calc-result">
                = <strong>{peso(splitItem.price / splitModal.memberIds.length)}</strong> each
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-muted" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Confirm Split
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemSplitModal;
