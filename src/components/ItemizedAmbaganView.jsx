import { useState } from 'react';
import { ArrowRight, Plus, Check, CheckCircle2, Utensils, GripVertical, Inbox, X, Users } from './CustomIcons';
import Avatar from './Avatar';
import PageHeader from './PageHeader';
import { expensesApi } from '../lib/api';
import { peso, todayISO } from '../lib/format';

/**
 * Step 2 of adding an expense: drag each item onto the people who had it.
 *
 * Everything here edits `draft.items` — each item has the member ids who
 * shared it. An item on one person is theirs alone; an item on several people
 * is split between them. "Continue" saves the expense: one item becomes an
 * equal split, several become an itemized split (the server does the exact
 * centavo math).
 *
 *   draft: { groupId, members, items: [{ id, name, price, memberIds }], description, paidBy }
 */
export const ItemizedAmbaganView = ({
  draft,
  onDraftChange,
  onBack,
  onNavigateAddExpense,
  onSaved,
  onCancel,
}) => {
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItemData, setDraggedItemData] = useState(null); // { itemId, sourceBucketId }
  const [dragOverTargetId, setDragOverTargetId] = useState(null);
  const [activeReassignMenu, setActiveReassignMenu] = useState(null); // { bucketId, itemId }
  const [splitModal, setSplitModal] = useState(null); // { itemId, memberIds }

  const { items, members } = draft;
  const me = members.find((m) => m.isCurrentUser);
  const paidBy = draft.paidBy ?? me?.id ?? members[0]?.id;
  const nameOf = Object.fromEntries(members.map((m) => [m.id, m.isCurrentUser ? 'You' : m.name]));

  const flash = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ─── Derived view of the draft ──────────────────────────────────────────
  const unassignedItems = items.filter((i) => i.memberIds.length === 0);
  const buckets = members.map((m) => ({
    ...m,
    assignedItems: items
      .filter((i) => i.memberIds.includes(m.id))
      .map((i) => ({
        id: i.id,
        name: i.memberIds.length > 1 ? `${i.name} (÷${i.memberIds.length})` : i.name,
        price: i.price / i.memberIds.length,
      })),
  }));
  const overallTotal = items.reduce((sum, i) => sum + i.price, 0);
  const totalAssignedAmount = items.filter((i) => i.memberIds.length).reduce((sum, i) => sum + i.price, 0);
  const remainingAmount = overallTotal - totalAssignedAmount;
  const assignedPercentage = overallTotal > 0 ? (totalAssignedAmount / overallTotal) * 100 : 0;

  // ─── Editing the draft ──────────────────────────────────────────────────
  const update = (changes) => onDraftChange((d) => ({ ...d, ...changes }));
  const setItemMembers = (itemId, memberIds) =>
    onDraftChange((d) => ({ ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, memberIds } : i)) }));
  const itemById = (id) => items.find((i) => i.id === id);

  /** Move an item from one person (or the unassigned pool) to another person. */
  const moveItem = (itemId, sourceBucketId, targetBucketId) => {
    const item = itemById(itemId);
    if (!item || sourceBucketId === targetBucketId) return;
    const others = item.memberIds.filter((id) => id !== sourceBucketId && id !== targetBucketId);
    setItemMembers(itemId, sourceBucketId ? [...others, targetBucketId] : [targetBucketId]);
    flash(`Assigned "${item.name}" to ${nameOf[targetBucketId]}! ✨`);
  };

  /** Take one person off an item (back to the pool if nobody is left). */
  const handleUnassignItem = (bucketId, itemId) => {
    const item = itemById(itemId);
    if (item) setItemMembers(itemId, item.memberIds.filter((id) => id !== bucketId));
  };

  /** Put a set of member ids on an item, kept in group order. */
  const shareItem = (itemId, memberIds) => {
    const set = new Set(memberIds);
    setItemMembers(itemId, members.map((m) => m.id).filter((id) => set.has(id)));
  };

  /** "Split with → All": everyone in the group shares the item equally. */
  const splitWithAll = (itemId) => {
    const item = itemById(itemId);
    if (!item) return;
    shareItem(itemId, members.map((m) => m.id));
    flash(`Split "${item.name}" with everyone (${peso(item.price / members.length)} each)! 🤝`);
  };

  /** "Split with → <name>": add/remove one person; the bucket owner always stays on it. */
  const toggleSplitWith = (itemId, ownerId, memberId) => {
    const item = itemById(itemId);
    if (!item) return;
    const has = item.memberIds.includes(memberId);
    const next = has ? item.memberIds.filter((id) => id !== memberId) : [...item.memberIds, memberId];
    if (!next.includes(ownerId)) next.push(ownerId);
    shareItem(itemId, next);
    flash(
      has
        ? `Removed ${nameOf[memberId]} from "${item.name}".`
        : `Split "${item.name}" with ${nameOf[memberId]} (${peso(item.price / next.length)} each)! 🤝`,
    );
  };

  const handleRemoveItem = (itemId) =>
    onDraftChange((d) => ({ ...d, items: d.items.filter((i) => i.id !== itemId) }));

  // ─── Drag & drop ────────────────────────────────────────────────────────
  const handleDragStart = (e, itemId, sourceBucketId = null) => {
    const payload = { itemId, sourceBucketId };
    setDraggedItemData(payload);
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'move';
    } catch {
      /* some browsers block dataTransfer; state above is enough */
    }
  };

  const readDrag = (e) => {
    if (draggedItemData) return draggedItemData;
    try {
      return JSON.parse(e.dataTransfer.getData('application/json'));
    } catch {
      return null;
    }
  };

  const endDrag = () => {
    setDraggedItemData(null);
    setDragOverTargetId(null);
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (dragOverTargetId !== targetId) setDragOverTargetId(targetId);
  };

  const handleDragLeave = (e, targetId) => {
    e.preventDefault();
    if (dragOverTargetId === targetId) setDragOverTargetId(null);
  };

  const handleDropOnBucket = (e, targetBucketId) => {
    e.preventDefault();
    const data = readDrag(e);
    if (data?.itemId) moveItem(data.itemId, data.sourceBucketId, targetBucketId);
    endDrag();
  };

  const handleDropOnUnassigned = (e) => {
    e.preventDefault();
    const data = readDrag(e);
    if (data?.itemId && data.sourceBucketId) handleUnassignItem(data.sourceBucketId, data.itemId);
    endDrag();
  };

  // ─── Split modal: share one item between several people ─────────────────
  const openSplitModal = (bucketId) => {
    const first = buckets.find((b) => b.id === bucketId)?.assignedItems[0];
    if (first) setSplitModal({ itemId: first.id, memberIds: members.map((m) => m.id) });
  };

  const toggleSplitMember = (memberId) =>
    setSplitModal((m) => {
      const has = m.memberIds.includes(memberId);
      if (has && m.memberIds.length <= 1) return m; // keep at least one
      return { ...m, memberIds: has ? m.memberIds.filter((id) => id !== memberId) : [...m.memberIds, memberId] };
    });

  const confirmSplit = () => {
    const item = itemById(splitModal.itemId);
    setItemMembers(splitModal.itemId, splitModal.memberIds);
    flash(`Split "${item.name}" (${peso(item.price / splitModal.memberIds.length)} each) across ${splitModal.memberIds.length} people! 🤝`);
    setSplitModal(null);
  };

  // ─── Save ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!items.length) return flash('Add at least one item first.');
    if (unassignedItems.length) return flash(`Assign ${unassignedItems.length === 1 ? '"' + unassignedItems[0].name + '"' : 'every item'} to someone first.`);
    const description = (draft.description || items[0].name).trim();
    if (!description) return flash('Give this expense a name.');

    const common = { description, paidBy, spentOn: todayISO() };
    const body =
      items.length === 1
        ? { ...common, splitType: 'equal', totalAmount: items[0].price, memberIds: items[0].memberIds }
        : {
            ...common,
            splitType: 'itemized',
            items: items.map(({ name, price, memberIds }) => ({ name, price, memberIds })),
          };

    setIsSaving(true);
    try {
      const expense = await expensesApi.create(draft.groupId, body);
      onSaved(expense);
    } catch (err) {
      setIsSaving(false);
      flash(Object.values(err.fields || {})[0] || err.message);
    }
    return undefined;
  };

  const splitItem = splitModal && itemById(splitModal.itemId);

  return (
    <div className="item-split-page-container animate-fade-in" onClick={() => setActiveReassignMenu(null)}>
      <PageHeader
        title="Item Split"
        action={
          onCancel && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} id="btn-cancel-expense">
              Cancel
            </button>
          )
        }
        onBack={onBack}
        backLabel="Back to calculator"
        backId="btn-back-to-calculator"
      />

      <div className="item-split-content-wrapper">
        {toastMessage && (
          <div className="banner banner-success item-split-toast-banner animate-fade-in">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="item-split-page-header">
          <h1 className="page-title">Itemized Ambagan</h1>
          <p className="page-subtitle">
            {draft.description || 'New expense'} • Total: {peso(overallTotal)}
          </p>

          {/* Expense name (who paid is chosen on the Add Expenses step) */}
          <div className="item-split-meta-row">
            <input
              className="form-input"
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Expense name, e.g. Yabu Dinner"
              maxLength={120}
              aria-label="Expense name"
            />
          </div>
        </div>

        <div className="split-progress-section">
          <div className="split-progress-bar-track">
            <div className="split-progress-bar-fill" style={{ width: `${Math.min(100, assignedPercentage)}%` }} />
          </div>
          <div className="split-progress-labels-row">
            <span className="label-assigned">{peso(totalAssignedAmount)} Assigned</span>
            <span className="label-remaining">{peso(remainingAmount)} Remaining</span>
          </div>
        </div>

        <div className="split-main-grid">
          {/* Unassigned items */}
          <div className="unassigned-items-col">
            <div className="unassigned-strip-header">
              <span className="unassigned-strip-title">Unassigned Items</span>
            </div>

            <div
              className={`unassigned-cards-list ${dragOverTargetId === 'unassigned' ? 'drag-over-active' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'unassigned')}
              onDragLeave={(e) => handleDragLeave(e, 'unassigned')}
              onDrop={handleDropOnUnassigned}
            >
              {unassignedItems.map((item) => (
                <div
                  key={item.id}
                  className={`unassigned-item-card ${draggedItemData?.itemId === item.id ? 'is-dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, null)}
                  onDragEnd={endDrag}
                  title="Drag onto a person, or use the quick assign buttons"
                >
                  <div className="unassigned-item-info">
                    <div className="unassigned-title-row">
                      <GripVertical size={14} className="drag-handle-unassigned" />
                      <h3 className="unassigned-item-name">{item.name}</h3>
                    </div>
                    <div className="unassigned-item-category">
                      <Utensils size={13} color="#7E8492" />
                      <span>Needs an owner</span>
                    </div>
                  </div>

                  <div className="unassigned-item-right">
                    <span className="unassigned-item-price">{peso(item.price)}</span>
                    <div className="quick-assign-buttons">
                      {members.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className="btn-quick-assign-member"
                          onClick={() => moveItem(item.id, null, m.id)}
                          title={`Assign to ${nameOf[m.id]}`}
                        >
                          +{nameOf[m.id].charAt(0)}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="btn-remove-assigned-item"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove this item"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {unassignedItems.length === 0 && (
                <div className="unassigned-empty-box">
                  <CheckCircle2 size={24} color="#059669" />
                  <span>{items.length ? 'All items have been assigned! 🎉' : 'No items yet.'}</span>
                </div>
              )}

              <button
                type="button"
                className="btn-add-unassigned-item"
                onClick={onNavigateAddExpense}
                id="btn-open-add-item-calc"
                title="Add another item with the calculator"
              >
                <Plus size={16} strokeWidth={2.4} />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* One bucket per member */}
          <div className="member-buckets-col">
            <div className="member-buckets-grid">
              {buckets.map((bucket) => (
                <div key={bucket.id} className={`member-bucket-card ${dragOverTargetId === bucket.id ? 'bucket-drag-hover' : ''}`}>
                  <div className="bucket-card-header">
                    <div className="bucket-avatar-wrapper">
                      <Avatar person={bucket} className="bucket-avatar-img" />
                    </div>
                    <h3 className="bucket-member-name">{nameOf[bucket.id]}</h3>
                  </div>

                  <div
                    className={`bucket-items-dropzone ${dragOverTargetId === bucket.id ? 'drag-over-active' : ''}`}
                    onDragOver={(e) => handleDragOver(e, bucket.id)}
                    onDragLeave={(e) => handleDragLeave(e, bucket.id)}
                    onDrop={(e) => handleDropOnBucket(e, bucket.id)}
                  >
                    {bucket.assignedItems.map((assigned) => {
                      const isMenuOpen = activeReassignMenu?.bucketId === bucket.id && activeReassignMenu?.itemId === assigned.id;
                      return (
                        <div
                          key={assigned.id}
                          className={`bucket-assigned-item-row ${draggedItemData?.itemId === assigned.id ? 'is-dragging' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, assigned.id, bucket.id)}
                          onDragEnd={endDrag}
                          title="Drag to move to another person, or use the split menu"
                        >
                          <div className="assigned-item-left">
                            <GripVertical size={14} className="drag-handle-icon" />
                            <span className="assigned-item-title">{assigned.name}</span>
                          </div>

                          <div className="assigned-item-right">
                            <span className="assigned-item-amount">{peso(assigned.price)}</span>

                            <div className="reassign-btn-wrapper" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="btn-reassign-item"
                                onClick={() => setActiveReassignMenu(isMenuOpen ? null : { bucketId: bucket.id, itemId: assigned.id })}
                                title="Split with others"
                                aria-label="Split with others"
                              >
                                <Users size={12} color="#FFFFFF" strokeWidth={2.4} />
                              </button>

                              {isMenuOpen && (() => {
                                const sharedBy = itemById(assigned.id)?.memberIds ?? [];
                                const sharedWithAll = members.every((m) => sharedBy.includes(m.id));
                                return (
                                  <div className="reassign-dropdown-menu animate-fade-in">
                                    <span className="reassign-menu-title">Split with:</span>
                                    <button
                                      type="button"
                                      className={`reassign-menu-item split-with-opt ${sharedWithAll ? 'is-selected' : ''}`}
                                      onClick={() => {
                                        setActiveReassignMenu(null);
                                        splitWithAll(assigned.id);
                                      }}
                                    >
                                      <span>All</span>
                                      {sharedWithAll && <Check size={13} color="#7C3AED" strokeWidth={3} />}
                                    </button>
                                    {members
                                      .filter((m) => m.id !== bucket.id)
                                      .map((target) => {
                                        const isOn = sharedBy.includes(target.id);
                                        return (
                                          <button
                                            key={target.id}
                                            type="button"
                                            className={`reassign-menu-item split-with-opt ${isOn ? 'is-selected' : ''}`}
                                            onClick={() => toggleSplitWith(assigned.id, bucket.id, target.id)}
                                          >
                                            <span>{nameOf[target.id]}</span>
                                            {isOn && <Check size={13} color="#7C3AED" strokeWidth={3} />}
                                          </button>
                                        );
                                      })}
                                    <button
                                      type="button"
                                      className="reassign-menu-item unassign-opt"
                                      onClick={() => {
                                        setActiveReassignMenu(null);
                                        handleUnassignItem(bucket.id, assigned.id);
                                      }}
                                    >
                                      ↩ Unassign Item
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>

                            <button
                              type="button"
                              className="btn-remove-assigned-item"
                              onClick={() => handleUnassignItem(bucket.id, assigned.id)}
                              title="Unassign item"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {bucket.assignedItems.length === 0 && (
                      <div className="bucket-empty-drop-placeholder">
                        <Inbox size={26} strokeWidth={1.8} className="drop-inbox-icon" />
                        <span>Drop items here</span>
                      </div>
                    )}
                  </div>

                  <div className="bucket-action-footer">
                    <button
                      type="button"
                      className="btn-split-bucket-item"
                      onClick={() => openSplitModal(bucket.id)}
                      disabled={bucket.assignedItems.length === 0}
                    >
                      Split Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="item-split-bottom-action">
          <button
            type="button"
            className="btn btn-primary btn-lg btn-mobile-block"
            onClick={handleSave}
            disabled={isSaving}
            id="btn-item-split-continue-action"
          >
            <span>{isSaving ? 'Saving…' : `Save Expense · ${peso(overallTotal)}`}</span>
            <ArrowRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Split one item between several people */}
      {splitModal && splitItem && (
        <div className="modal-backdrop" onClick={() => setSplitModal(null)}>
          <div className="modal-card split-item-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
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
              <button className="modal-close-btn" onClick={() => setSplitModal(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body split-modal-body">
              <div className="form-group">
                <label className="form-label">Select Item to Split</label>
                <div className="custom-select-wrapper">
                  <select
                    value={splitModal.itemId}
                    onChange={(e) => setSplitModal({ ...splitModal, itemId: e.target.value })}
                    className="form-select custom-select-input"
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
                        className={`split-member-pill-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSplitMember(m.id)}
                      >
                        <Avatar person={m} className="split-member-avatar-circle" />
                        <span className="split-member-name">{nameOf[m.id]}</span>
                        {isSelected && <Check size={14} color="#7C3AED" strokeWidth={3} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="split-preview-summary-box">
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
              <button type="button" className="btn btn-muted" onClick={() => setSplitModal(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmSplit}>
                Confirm Split
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemizedAmbaganView;
