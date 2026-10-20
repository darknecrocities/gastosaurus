import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AppModals from './components/AppModals';
import { supabase } from './lib/supabase';
import { profileApi, groupsApi, meApi, invitesApi, settlementsApi } from './lib/api';
import { useAsync } from './hooks/useAsync';
import { useNotifications } from './hooks/useNotifications';
import { useJoinCode, readJoinCode } from './hooks/useJoinCode';
import './App.css';

// Everything behind the login loads on demand, so the landing page stays light.
const Dashboard = lazy(() => import('./components/Dashboard'));
const GroupsView = lazy(() => import('./components/GroupsView'));
const GroupMembersView = lazy(() => import('./components/GroupMembersView'));
const ExpensesDetailView = lazy(() => import('./components/ExpensesDetailView'));
const SettlementsView = lazy(() => import('./components/SettlementsView'));
const InviteMemberView = lazy(() => import('./components/InviteMemberView'));
const PaymentView = lazy(() => import('./components/PaymentView'));
const AddExpenseCalculatorView = lazy(() => import('./components/AddExpenseCalculatorView'));
const ItemizedAmbaganView = lazy(() => import('./components/ItemizedAmbaganView'));
const NotificationsView = lazy(() => import('./components/NotificationsView'));

// Which navbar tab is highlighted on each screen (inner screens belong to a tab).
const TAB_FOR_VIEW = {
  dashboard: 'dashboard',
  groups: 'groups',
  'group-members': 'groups',
  'invite-member': 'groups',
  'expenses-detail': 'groups',
  'add-expense-calculator': 'groups',
  'item-split': 'groups',
  settlements: 'settlements',
  payment: 'settlements',
};

const EXPENSE_FLOW_VIEWS = new Set(['add-expense-calculator', 'item-split']);


function App() {
  // ─── Auth ────────────────────────────────────────────────────────────────
  // Supabase keeps the session; our API (/api/me) returns the profile.
  const [authUser, setAuthUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'update-password'

  // ─── Navigation ──────────────────────────────────────────────────────────
  const [requestedView, setRequestedView] = useState('landing');
  const currentView = authUser ? requestedView : 'landing'; // everything but the landing page needs a login
  const [previousView, setPreviousView] = useState('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const go = useCallback((view) => {
    setRequestedView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Data ────────────────────────────────────────────────────────────────
  // Bumping refreshKey makes every screen re-fetch. Call refresh() after any save.
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const userId = authUser?.id;
  const groupsQuery = useAsync(() => groupsApi.list(), [userId, refreshKey], { enabled: !!userId });
  const summaryQuery = useAsync(() => meApi.summary(), [userId, refreshKey], { enabled: !!userId });
  const groups = groupsQuery.data ?? [];
  const inbox = useNotifications(userId, { onIncoming: refresh });

  // ─── Toast ───────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((message, tone = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);
  const showError = useCallback((err) => showToast(err?.message || 'Something went wrong.', 'error'), [showToast]);

  // ─── Modals and in-progress flows ────────────────────────────────────────
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isPersonalBalanceOpen, setIsPersonalBalanceOpen] = useState(false);
  const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);
  const [isChooseDinoOpen, setIsChooseDinoOpen] = useState(false);
  const [isDinoOnboarding, setIsDinoOnboarding] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState(null); // { groupId, members, items, description, paidBy }
  const [paymentItems, setPaymentItems] = useState([]); // suggested payments chosen on Settlements

  // Supabase Auth: restores "Keep me logged in" sessions, finishes
  // email-link sign-ins, and reacts to log out.
  useEffect(() => {
    if (!supabase) return undefined;

    const loadProfile = async (session) => {
      try {
        return await profileApi.get();
      } catch (err) {
        console.warn('[auth] Could not load profile from /api/me:', err.message);
        const meta = session.user.user_metadata || {};
        return {
          id: session.user.id,
          email: session.user.email,
          name: meta.name || meta.full_name || session.user.email?.split('@')[0] || 'Budget Dino',
        };
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update-password');
        setIsAuthOpen(true);
      }
      if (!session) {
        setAuthUser(null);
        // Opened an invite link while logged out → ask them to sign up / log in first.
        if (event === 'INITIAL_SESSION' && readJoinCode()) {
          setAuthMode('signup');
          setIsAuthOpen(true);
        }
        return;
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Supabase recommends not awaiting other Supabase calls inside this callback.
        setTimeout(async () => {
          setAuthUser(await loadProfile(session));
          if (event === 'INITIAL_SESSION') setRequestedView((v) => (v === 'landing' ? 'dashboard' : v));
        }, 0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Join-by-link: <app>/?join=<code> via useJoinCode hook.
  useJoinCode(authUser, {
    onJoined: (group) => {
      showToast(`You're in "${group.name}"! 🦖`);
      setSelectedGroupId(group.id);
      go('group-members');
      refresh();
    },
    onError: showError,
  });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const openAuth = (mode = 'login') => {
    if (authUser) return go('dashboard');
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (options = {}) => {
    setIsAuthOpen(false);
    if (options?.isSignUp) {
      setIsDinoOnboarding(true);
      setIsChooseDinoOpen(true);
    }
    go('dashboard');
  };

  const handleDinoSaved = (updatedUser) => {
    setAuthUser((prev) => ({ ...prev, ...updatedUser }));
    setIsChooseDinoOpen(false);
    refresh();
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setAuthUser(null);
    setSelectedGroupId(null);
    setExpenseDraft(null);
    go('landing');
  };

  const openGroup = (group) => {
    setSelectedGroupId(group.id);
    go('group-members');
  };

  const openNotifications = () => {
    if (EXPENSE_FLOW_VIEWS.has(currentView) && !discardExpense()) return;
    if (currentView !== 'notifications') setPreviousView(EXPENSE_FLOW_VIEWS.has(currentView) ? 'dashboard' : currentView);
    go('notifications');
  };

  const handleGroupCreated = (detail) => {
    setIsCreateGroupOpen(false);
    setSelectedGroupId(detail.group.id);
    showToast(`Created "${detail.group.name}" 🎉 Now invite your squad.`);
    refresh();
    go('invite-member');
  };

  // Add expense: calculator (one item at a time) → item split → save.
  const startExpense = (groupId = selectedGroupId ?? groups[0]?.id) => {
    if (!groupId) {
      showToast('Create a group first, then add expenses to it.', 'error');
      setIsCreateGroupOpen(true);
      return;
    }
    setSelectedGroupId(groupId);
    setExpenseDraft({ groupId, members: [], items: [], description: '', paidBy: null });
    go('add-expense-calculator');
  };

  const handleCalculatorContinue = (item, members, paidBy) => {
    setExpenseDraft((d) => ({
      ...d,
      members,
      paidBy,
      description: d.description || item.name,
      items: [...d.items, { ...item, id: `item-${Date.now()}` }],
    }));
    go('item-split');
  };

  const backToGroup = () => (selectedGroupId ? go('group-members') : go('groups'));

  /** Leave the add-expense flow. Asks first only if items were already entered. */
  const discardExpense = () => {
    if (expenseDraft?.items.length && !window.confirm('Discard this expense? The items you entered will be lost.')) {
      return false;
    }
    setExpenseDraft(null);
    return true;
  };

  const cancelExpense = () => {
    if (discardExpense()) backToGroup();
  };

  /** Navbar: Home / Groups / Settlements (and the logo, which goes Home). */
  const navigate = (view) => {
    if (EXPENSE_FLOW_VIEWS.has(currentView) && !discardExpense()) return;
    go(view);
  };

  const handleExpenseSaved = (expense) => {
    showToast(`Added "${expense.description}" — ₱${expense.totalAmount.toFixed(2)} 🎉`);
    setExpenseDraft(null);
    setSelectedGroupId(expense.groupId);
    refresh();
    go('group-members');
  };

  const handleLeftGroup = (groupName) => {
    showToast(`You left "${groupName}". It's been cleared from your groups and totals.`);
    setSelectedGroupId(null);
    refresh();
    go('groups');
  };

  const openPayment = (items) => {
    setPaymentItems(items);
    go('payment');
  };

  const handleAcceptInvite = async (invite) => {
    try {
      const group = await invitesApi.accept(invite.id);
      showToast(`You joined "${group.name}" 🦖`);
      inbox.reload();
      refresh();
      openGroup(group);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeclineInvite = async (invite) => {
    try {
      await invitesApi.decline(invite.id);
      showToast('Invite declined.');
      inbox.reload();
    } catch (err) {
      showError(err);
    }
  };

  const handleConfirmPayment = async (settlementId) => {
    try {
      const s = await settlementsApi.confirm(settlementId);
      showToast(`Confirmed ₱${s.amount.toFixed(2)} from ${s.from.name} ✅`);
      refresh();
    } catch (err) {
      showError(err);
    }
  };


  return (
    <div className="app-container">
      {currentView !== 'landing' && (
        <Navbar
          currentTab={TAB_FOR_VIEW[currentView]}
          onSelectTab={navigate}
          onNavigateHome={() => navigate('dashboard')}
          unreadCount={inbox.unreadCount}
          onOpenNotifs={openNotifications}
          authUser={authUser}
          userName={authUser?.name}
          onOpenProfileModal={() => {
            setIsDinoOnboarding(false);
            setIsChooseDinoOpen(true);
          }}
          onLogout={handleLogout}
        />
      )}

      <main className="main-content-area">
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          {currentView === 'landing' && (
            <LandingPage
              onStartSaving={() => openAuth('login')}
              onOpenAuth={openAuth}
              onOpenDashboard={() => openAuth('login')}
              isLoggedIn={!!authUser}
            />
          )}

          {currentView === 'dashboard' && (
            <Dashboard
              authUser={authUser}
              summary={summaryQuery.data}
              groups={groups}
              isLoading={groupsQuery.loading && !groupsQuery.data}
              onSettleUpClick={() => go('settlements')}
              onPersonalBalanceClick={() => setIsPersonalBalanceOpen(true)}
              onViewGroupClick={openGroup}
              onViewAllGroups={() => go('groups')}
              onCreateGroupClick={() => setIsCreateGroupOpen(true)}
            />
          )}

          {currentView === 'groups' && (
            <GroupsView groups={groups} onViewGroupClick={openGroup} onAddGroup={() => setIsCreateGroupOpen(true)} />
          )}

          {currentView === 'group-members' && selectedGroupId && (
            <GroupMembersView
              groupId={selectedGroupId}
              refreshKey={refreshKey}
              onBack={() => go('groups')}
              onViewSettlements={() => go('settlements')}
              onViewExpensesDetail={() => go('expenses-detail')}
              onAddExpense={() => startExpense(selectedGroupId)}
              onNavigateInviteMember={() => go('invite-member')}
              onOpenDetails={() => setIsGroupDetailOpen(true)}
              onLeft={handleLeftGroup}
              onChanged={refresh}
              showToast={showToast}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsView
              notifications={inbox.notifications}
              invites={inbox.invites}
              onMarkAllRead={inbox.markAllRead}
              onAcceptInvite={handleAcceptInvite}
              onDeclineInvite={handleDeclineInvite}
              onConfirmPayment={handleConfirmPayment}
              onOpenGroup={(groupId) => openGroup({ id: groupId })}
              onBack={() => go(previousView || 'dashboard')}
            />
          )}

          {currentView === 'invite-member' && selectedGroupId && (
            <InviteMemberView
              groupId={selectedGroupId}
              onBack={backToGroup}
              onContinue={backToGroup}
              onChanged={refresh}
              showToast={showToast}
            />
          )}

          {currentView === 'add-expense-calculator' && expenseDraft && (
            <AddExpenseCalculatorView
              groups={expenseDraft.items.length ? [] : groups} // switching groups only before the first item
              groupId={expenseDraft.groupId}
              initialPaidBy={expenseDraft.paidBy}
              onChangeGroup={(groupId) => startExpense(groupId)}
              onBack={() => {
                if (expenseDraft.items.length) go('item-split');
                else {
                  setExpenseDraft(null);
                  backToGroup();
                }
              }}
              onContinue={handleCalculatorContinue}
              onCancel={cancelExpense}
              showToast={showToast}
            />
          )}

          {currentView === 'item-split' && expenseDraft && (
            <ItemizedAmbaganView
              draft={expenseDraft}
              onDraftChange={setExpenseDraft}
              onBack={() => go('add-expense-calculator')}
              onNavigateAddExpense={() => go('add-expense-calculator')}
              onSaved={handleExpenseSaved}
              onCancel={cancelExpense}
              showToast={showToast}
            />
          )}

          {currentView === 'expenses-detail' && selectedGroupId && (
            <ExpensesDetailView
              groupId={selectedGroupId}
              refreshKey={refreshKey}
              onBack={() => go('group-members')}
              onAddExpense={() => startExpense(selectedGroupId)}
              onViewSettlements={() => go('settlements')}
              onChanged={refresh}
              showToast={showToast}
            />
          )}

          {currentView === 'settlements' && (
            <SettlementsView
              refreshKey={refreshKey}
              onNavigatePayment={openPayment}
              onViewGroupMembers={backToGroup}
              onChanged={refresh}
              showToast={showToast}
            />
          )}

          {currentView === 'payment' && (
            <PaymentView
              items={paymentItems}
              onBack={() => go('settlements')}
              onDone={() => {
                refresh();
                go('settlements');
              }}
              showToast={showToast}
            />
          )}
        </Suspense>
      </main>

      <AppModals
        toast={toast}
        onDismissToast={() => setToast(null)}
        isAuthOpen={isAuthOpen}
        authMode={authMode}
        onCloseAuth={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        isCreateGroupOpen={isCreateGroupOpen}
        currentUserName={authUser?.name}
        onCloseCreateGroup={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
        isPersonalBalanceOpen={isPersonalBalanceOpen}
        personalBalanceSummary={summaryQuery.data}
        onClosePersonalBalance={() => setIsPersonalBalanceOpen(false)}
        onPersonalBalanceChanged={refresh}
        isGroupDetailOpen={isGroupDetailOpen}
        selectedGroupId={selectedGroupId}
        refreshKey={refreshKey}
        onCloseGroupDetail={() => setIsGroupDetailOpen(false)}
        onGroupDetailChanged={refresh}
        onGroupDetailDeleted={() => {
          setIsGroupDetailOpen(false);
          setSelectedGroupId(null);
          refresh();
          go('groups');
        }}
        onAddExpenseToGroup={() => {
          setIsGroupDetailOpen(false);
          startExpense(selectedGroupId);
        }}
        isChooseDinoOpen={isChooseDinoOpen}
        authUser={authUser}
        isDinoOnboarding={isDinoOnboarding}
        onCloseChooseDino={() => setIsChooseDinoOpen(false)}
        onDinoSaved={handleDinoSaved}
        showToast={showToast}
      />
    </div>
  );
}

export default App;
