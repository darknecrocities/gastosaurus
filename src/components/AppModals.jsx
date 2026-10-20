import { Suspense, lazy } from 'react';
import AuthModal from './AuthModal';
import DownloadModal from './DownloadModal';
import PwaInstallBanner from './PwaInstallBanner';

const PersonalBalanceModal = lazy(() => import('./PersonalBalanceModal'));
const GroupDetailModal = lazy(() => import('./GroupDetailModal'));
const CreateGroupModal = lazy(() => import('./CreateGroupModal'));
const ChooseDinoModal = lazy(() => import('./ChooseDinoModal'));

/**
 * Encapsulated Modals & Toast layer to keep App.jsx modular and well within the 500-line ceiling.
 */
export const AppModals = ({
  toast,
  onDismissToast,
  isAuthOpen,
  authMode,
  onCloseAuth,
  onAuthSuccess,
  isDownloadOpen,
  onOpenDownload,
  onCloseDownload,
  isCreateGroupOpen,
  currentUserName,
  onCloseCreateGroup,
  onGroupCreated,
  isPersonalBalanceOpen,
  personalBalanceSummary,
  onClosePersonalBalance,
  onPersonalBalanceChanged,
  isGroupDetailOpen,
  selectedGroupId,
  refreshKey,
  onCloseGroupDetail,
  onGroupDetailChanged,
  onGroupDetailDeleted,
  onAddExpenseToGroup,
  isChooseDinoOpen,
  authUser,
  isDinoOnboarding,
  onCloseChooseDino,
  onDinoSaved,
  showToast,
}) => {
  return (
    <>
      {toast && (
        <div
          className={`app-toast app-toast-${toast.tone} liquid-glass-card animate-pop`}
          role="status"
          onClick={onDismissToast}
        >
          {toast.message}
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={onCloseAuth}
        onAuthSuccess={onAuthSuccess}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={onCloseDownload}
      />

      <PwaInstallBanner
        onOpenGuide={onOpenDownload}
        showToast={showToast}
      />

      <Suspense fallback={null}>
        {isCreateGroupOpen && (
          <CreateGroupModal
            isOpen={isCreateGroupOpen}
            currentUserName={currentUserName}
            onClose={onCloseCreateGroup}
            onGroupCreated={onGroupCreated}
          />
        )}

        {isPersonalBalanceOpen && (
          <PersonalBalanceModal
            isOpen={isPersonalBalanceOpen}
            summary={personalBalanceSummary}
            onClose={onClosePersonalBalance}
            onChanged={onPersonalBalanceChanged}
            showToast={showToast}
          />
        )}

        {isGroupDetailOpen && selectedGroupId && (
          <GroupDetailModal
            groupId={selectedGroupId}
            refreshKey={refreshKey}
            isOpen={isGroupDetailOpen && !!selectedGroupId}
            onClose={onCloseGroupDetail}
            onChanged={onGroupDetailChanged}
            onDeleted={onGroupDetailDeleted}
            showToast={showToast}
            onAddExpenseToGroup={onAddExpenseToGroup}
          />
        )}

        {isChooseDinoOpen && (
          <ChooseDinoModal
            isOpen={isChooseDinoOpen}
            user={authUser}
            isInitialOnboarding={isDinoOnboarding}
            onClose={onCloseChooseDino}
            onDinoSaved={onDinoSaved}
            showToast={showToast}
          />
        )}
      </Suspense>
    </>
  );
};

export default AppModals;
