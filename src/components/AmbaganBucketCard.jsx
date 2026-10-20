import Avatar from './Avatar';
import { GripVertical, Users, X, Check, Inbox } from './CustomIcons';
import { peso } from '../lib/format';

export const AmbaganBucketCard = ({
  bucket,
  nameOf,
  dragOverTargetId,
  draggedItemData,
  activeReassignMenu,
  members,
  itemById,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onEndDrag,
  onToggleReassignMenu,
  onSplitWithAll,
  onToggleSplitWith,
  onUnassignItem,
  onOpenSplitModal,
}) => {
  return (
    <div className={`member-bucket-card liquid-glass-card ${dragOverTargetId === bucket.id ? 'bucket-drag-hover' : ''}`}>
      <div className="bucket-card-header">
        <div className="bucket-avatar-wrapper liquid-glass-subtle">
          <Avatar person={bucket} className="bucket-avatar-img" />
        </div>
        <h3 className="bucket-member-name">{nameOf[bucket.id]}</h3>
      </div>

      <div
        className={`bucket-items-dropzone ${dragOverTargetId === bucket.id ? 'drag-over-active' : ''}`}
        onDragOver={(e) => onDragOver(e, bucket.id)}
        onDragLeave={(e) => onDragLeave(e, bucket.id)}
        onDrop={(e) => onDrop(e, bucket.id)}
      >
        {bucket.assignedItems.map((assigned) => {
          const isMenuOpen =
            activeReassignMenu?.bucketId === bucket.id &&
            activeReassignMenu?.itemId === assigned.id;

          return (
            <div
              key={assigned.id}
              className={`bucket-assigned-item-row liquid-glass-subtle ${
                draggedItemData?.itemId === assigned.id ? 'is-dragging' : ''
              }`}
              draggable
              onDragStart={(e) => onDragStart(e, assigned.id, bucket.id)}
              onDragEnd={onEndDrag}
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
                    onClick={() => onToggleReassignMenu(bucket.id, assigned.id)}
                    title="Split with others"
                    aria-label="Split with others"
                  >
                    <Users size={12} color="#FFFFFF" strokeWidth={2.4} />
                  </button>

                  {isMenuOpen && (() => {
                    const sharedBy = itemById(assigned.id)?.memberIds ?? [];
                    const sharedWithAll = members.every((m) => sharedBy.includes(m.id));

                    return (
                      <div className="reassign-dropdown-menu liquid-glass-card animate-fade-in">
                        <span className="reassign-menu-title">Split with:</span>
                        <button
                          type="button"
                          className={`reassign-menu-item split-with-opt ${sharedWithAll ? 'is-selected' : ''}`}
                          onClick={() => onSplitWithAll(assigned.id)}
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
                                onClick={() => onToggleSplitWith(assigned.id, bucket.id, target.id)}
                              >
                                <span>{nameOf[target.id]}</span>
                                {isOn && <Check size={13} color="#7C3AED" strokeWidth={3} />}
                              </button>
                            );
                          })}

                        <button
                          type="button"
                          className="reassign-menu-item unassign-opt"
                          onClick={() => onUnassignItem(bucket.id, assigned.id)}
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
                  onClick={() => onUnassignItem(bucket.id, assigned.id)}
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
          className="btn-split-bucket-item active-press"
          onClick={() => onOpenSplitModal(bucket.id)}
          disabled={bucket.assignedItems.length === 0}
        >
          Split Item
        </button>
      </div>
    </div>
  );
};

export default AmbaganBucketCard;
