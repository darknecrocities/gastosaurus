import GroupCard from './GroupCard';
import { pesoParts, peso } from '../lib/format';
import netBalanceMascot from '../assets/net-balance-mascot.png';
import { sounds } from '../lib/sounds';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronRight, 
  Plus,
} from './CustomIcons';

export const Dashboard = ({
  authUser,
  summary,
  groups,
  isLoading,
  onSettleUpClick, 
  onPersonalBalanceClick, 
  onViewGroupClick,
  onViewAllGroups,
  onCreateGroupClick,
}) => {
  const net = pesoParts(summary?.netBalance ?? 0);
  const youOwe = summary?.youOwe ?? 0;
  const youAreOwed = summary?.youAreOwed ?? 0;
  const openTotal = youOwe + youAreOwed;
  const owePercent = openTotal ? Math.round((youOwe / openTotal) * 100) : 0;
  const owedPercent = openTotal ? 100 - owePercent : 0;
  const groupsLabel = (n) => `Across ${n} ${n === 1 ? 'group' : 'groups'}`;

  return (
    <div className="dashboard-page-container animate-fade-in">
      {/* Overview Header */}
      <section className="page-intro">
        <div className="page-intro-text">
          <h1 className="page-title">
            Financial <span className="text-gradient-shimmer">Overview</span>
          </h1>
          <p className="page-subtitle">
            {authUser?.name ? `Hey ${authUser.name}! Here is your ambagan snapshot for today.` : "Here is your ambagan snapshot for today."}
          </p>
        </div>
      </section>

      {/* Top Financial Stats Cards Grid */}
      <section className="dashboard-stats-grid">
        {/* 1. Net Balance Main Liquid Glass Card */}
        <div className="stat-card net-balance-card liquid-glass-card active-press">
          <div className="net-balance-content">
            <span className="eyebrow">Net balance</span>
            <div className="stat-main-amount">
              <span className="amount-sign">{net.sign}</span>
              <span className="amount-whole">{net.whole}</span>
              <span className="amount-decimal">{net.cents}</span>
            </div>

            <div className="net-balance-actions">
              <button 
                className="btn btn-primary active-press"
                onClick={() => {
                  sounds.playClick();
                  onSettleUpClick?.();
                }}
                id="btn-settle-up"
              >
                Settle Up
              </button>
              <button 
                className="btn btn-soft active-press"
                onClick={() => {
                  sounds.playClick();
                  onPersonalBalanceClick?.();
                }}
                id="btn-personal-balance"
              >
                Personal Balance
              </button>
            </div>
          </div>

          <div className="net-balance-mascot-wrapper">
            <img 
              src={netBalanceMascot} 
              alt="" 
              className="net-balance-mascot-img animate-float"
            />
          </div>
        </div>

        {/* 2. YOU OWE Card */}
        <div className="stat-card owe-card liquid-glass-card active-press">
          <div className="stat-card-top">
            <div className="stat-direction-badge owe-badge">
              <ArrowUp size={16} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="stat-card-mid">
            <span className="eyebrow">You owe</span>
            <h2 className="stat-amount amount-negative">{youOwe ? `-${peso(youOwe)}` : peso(0)}</h2>
            <span className="stat-subtext">{groupsLabel(summary?.oweGroupCount ?? 0)}</span>
          </div>

          <div className="stat-progress-track">
            <div className="progress-fill owe-progress-fill" style={{ width: `${owePercent}%` }} />
          </div>
        </div>

        {/* 3. YOU ARE OWED Card */}
        <div className="stat-card owed-card liquid-glass-card active-press">
          <div className="stat-card-top">
            <div className="stat-direction-badge owed-badge">
              <ArrowDown size={16} strokeWidth={2.5} />
            </div>
          </div>

          <div className="stat-card-mid">
            <span className="eyebrow">You are owed</span>
            <h2 className="stat-amount amount-positive">{youAreOwed ? `+${peso(youAreOwed)}` : peso(0)}</h2>
            <span className="stat-subtext">{groupsLabel(summary?.owedGroupCount ?? 0)}</span>
          </div>

          <div className="stat-progress-track">
            <div className="progress-fill owed-progress-fill" style={{ width: `${owedPercent}%` }} />
          </div>
        </div>
      </section>

      {/* Active Groups Section */}
      <section className="active-groups-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <h2 className="section-title">Active Groups</h2>
            <span className="section-count liquid-glass-subtle">{groups.length} active</span>
          </div>
          <div className="section-actions-wrap">
            {onCreateGroupClick && (
              <button 
                className="btn btn-primary btn-sm active-press"
                onClick={() => {
                  sounds.playClick();
                  onCreateGroupClick();
                }}
                title="Create a new active group"
              >
                <Plus size={16} /> New Group
              </button>
            )}
            <button 
              className="btn btn-ghost btn-sm active-press"
              onClick={() => {
                sounds.playPop();
                onViewAllGroups();
              }}
            >
              View all <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {!isLoading && groups.length === 0 && (
          <p className="empty-text liquid-glass-subtle">
            No groups yet. Create one, add your barkada, and start splitting. 🦖
          </p>
        )}

        {/* Groups Grid */}
        <div className="active-groups-grid">
          {groups.slice(0, 6).map((group) => (
            <GroupCard key={group.id} group={group} onOpen={onViewGroupClick} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
