import React, { useState } from 'react';
import { UserProfile, TripDetails, LoyaltyPointTransaction, RewardPerkItem, LoyaltyTierId } from '../types';
import { LOYALTY_TIERS, REWARD_PERK_ITEMS } from '../data/rewards';
import { offlineStorage } from '../services/offlineStorage';
import { 
  Award, 
  Clock, 
  Gift, 
  ShieldCheck, 
  Star, 
  Wallet, 
  ChevronRight, 
  CheckCircle2, 
  Car, 
  Bus, 
  Package, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  User, 
  RefreshCw,
  Zap,
  Info,
  Calendar,
  PartyPopper,
  HeartHandshake,
  Eye
} from 'lucide-react';

interface RewardsProfilePanelProps {
  userProfile: UserProfile;
  tripHistory: TripDetails[];
  onUpdateProfile: (profile: UserProfile) => void;
  onRebookTrip?: (trip: TripDetails) => void;
}

export const RewardsProfilePanel: React.FC<RewardsProfilePanelProps> = ({
  userProfile,
  tripHistory,
  onUpdateProfile,
  onRebookTrip,
}) => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'history' | 'activity'>('rewards');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'ride' | 'intercity' | 'delivery'>('all');
  const [redeemFeedback, setRedeemFeedback] = useState<string | null>(null);

  const currentTier = LOYALTY_TIERS[userProfile.currentTier] || LOYALTY_TIERS.bronze;
  
  // Calculate progress to next tier
  const getNextTierInfo = () => {
    if (userProfile.currentTier === 'bronze') return { next: LOYALTY_TIERS.silver, pointsNeeded: 500 - userProfile.loyaltyPoints, target: 500 };
    if (userProfile.currentTier === 'silver') return { next: LOYALTY_TIERS.gold, pointsNeeded: 1500 - userProfile.loyaltyPoints, target: 1500 };
    if (userProfile.currentTier === 'gold') return { next: LOYALTY_TIERS.platinum, pointsNeeded: 3500 - userProfile.loyaltyPoints, target: 3500 };
    return { next: null, pointsNeeded: 0, target: 3500 };
  };

  const nextTierInfo = getNextTierInfo();
  const progressPercent = nextTierInfo.next 
    ? Math.min(100, Math.max(0, (userProfile.loyaltyPoints / nextTierInfo.target) * 100))
    : 100;

  const transactions = offlineStorage.getLoyaltyTransactions();

  const handleRedeem = (perk: RewardPerkItem) => {
    const result = offlineStorage.redeemPerk(perk);
    if (result.success && result.updatedProfile) {
      onUpdateProfile(result.updatedProfile);
      setRedeemFeedback(`✓ ${result.message}`);
    } else {
      setRedeemFeedback(`! ${result.message}`);
    }

    setTimeout(() => {
      setRedeemFeedback(null);
    }, 4500);
  };

  const filteredHistory = tripHistory.filter((t) => {
    if (historyFilter === 'all') return true;
    return t.serviceMode === historyFilter;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Profile Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
              LK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white">{userProfile.name}</h2>
                <span title="Verified South African Passenger">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {userProfile.phone} · <span className="text-amber-400">★ {userProfile.rating}</span>
              </div>
            </div>
          </div>

          {/* Wallet Balance Chip */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">Hamba Wallet</div>
            <div className="text-sm font-extrabold text-amber-400 font-mono">
              R {userProfile.walletBalanceZAR}.00
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-3.5 grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'rewards' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Hamba Rewards</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Trip History ({tripHistory.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'activity' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Points Ledger</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {/* Feedback Alert Banner */}
        {redeemFeedback && (
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-200 text-xs font-medium animate-fadeIn">
            {redeemFeedback}
          </div>
        )}

        {/* Tab 1: Rewards & Loyalty Status */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {/* Loyalty Tier Status Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Current Passenger Status
                  </span>
                  <div className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                    <span>{currentTier.name} Tier</span>
                    <span className="text-xs font-normal text-slate-400 font-sans">
                      ({currentTier.indigenousName})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {userProfile.loyaltyPoints}
                  </div>
                  <div className="text-[11px] text-slate-400">Available Points</div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {nextTierInfo.next ? (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {nextTierInfo.pointsNeeded} pts to reach <strong className="text-white font-semibold">{nextTierInfo.next.name} ({nextTierInfo.next.indigenousName})</strong>
                    </span>
                    <span className="font-mono text-slate-300 font-bold">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-emerald-400 font-medium">
                  ★ Maximum Inkosi (Platinum) Tier Reached — VIP Concierge & 15% Savings Active!
                </div>
              )}

              {/* Active Tier Perks */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-slate-300 mb-2">Your Active Tier Benefits:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-400">
                  {currentTier.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Birthday Free Ride Special ("Ilanga Lokuzalwa") — 2nd Ride Free on Birthday! */}
            <div className={`p-4 rounded-2xl border transition-all ${
              offlineStorage.isUserBirthdayToday(userProfile.birthDate)
                ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <PartyPopper className="w-4 h-4 text-amber-400" />
                  <span>Birthday Free 2nd Ride Special (Paid by Hamba)</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                  offlineStorage.isUserBirthdayToday(userProfile.birthDate) && (userProfile.birthdayRidesTodayCount ?? 0) === 1
                    ? 'bg-emerald-400 text-slate-950 animate-pulse'
                    : offlineStorage.isUserBirthdayToday(userProfile.birthDate)
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {offlineStorage.isUserBirthdayToday(userProfile.birthDate)
                    ? (userProfile.birthdayRidesTodayCount ?? 0) === 1
                      ? '🎉 2ND RIDE 100% FREE NOW'
                      : (userProfile.birthdayRidesTodayCount ?? 0) === 0
                      ? '🎂 1ST RIDE PENDING (2ND WILL BE FREE)'
                      : '✓ FREE RIDE CLAIMED'
                    : 'Annual Perk'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                Free rides are offered to riders requesting for the <strong>second time on the same day of their birthday</strong>. The entire trip is <strong>paid in full by the Hamba app</strong> — drivers receive 100% of the fare directly from Hamba.
              </p>

              {/* Status Indicator for Today's Birthday Rides */}
              {offlineStorage.isUserBirthdayToday(userProfile.birthDate) && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Today's Birthday Rides Count:</span>
                    <span className="ml-1.5 font-mono font-bold text-amber-400 text-sm">
                      {userProfile.birthdayRidesTodayCount ?? 0}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-right">
                    {(userProfile.birthdayRidesTodayCount ?? 0) === 0 && (
                      <span className="text-amber-300">Take 1st ride today ➔ Next ride is 100% FREE</span>
                    )}
                    {(userProfile.birthdayRidesTodayCount ?? 0) === 1 && (
                      <span className="text-emerald-400 font-bold">🎉 2nd request active: This ride is R0.00!</span>
                    )}
                    {(userProfile.birthdayRidesTodayCount ?? 0) >= 2 && (
                      <span className="text-slate-400">2nd ride free perk already used today</span>
                    )}
                  </div>
                </div>
              )}

              {/* Date of Birth Picker & Simulation Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-700/50 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Date of Birth:</span>
                    <input
                      type="date"
                      value={userProfile.birthDate || '1998-10-28'}
                      onChange={(e) => {
                        const updated = { ...userProfile, birthDate: e.target.value };
                        onUpdateProfile(updated);
                        offlineStorage.saveUserProfile(updated);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const y = now.getFullYear();
                      const m = String(now.getMonth() + 1).padStart(2, '0');
                      const d = String(now.getDate()).padStart(2, '0');
                      const todayStr = `${y}-${m}-${d}`;
                      const updated = { ...userProfile, birthDate: todayStr };
                      onUpdateProfile(updated);
                      offlineStorage.saveUserProfile(updated);
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-[11px] font-semibold transition"
                  >
                    Set to Today ({new Date().toLocaleDateString('en-ZA')})
                  </button>
                </div>

                {/* Quick Interactive Ride Count Simulators */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 mr-1">Test Birthday Step:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = offlineStorage.setBirthdayRidesTodayCount(0);
                      onUpdateProfile(updated);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      (userProfile.birthdayRidesTodayCount ?? 0) === 0
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'
                    }`}
                  >
                    Set as 1st Ride (Pending)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = offlineStorage.setBirthdayRidesTodayCount(1);
                      onUpdateProfile(updated);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      (userProfile.birthdayRidesTodayCount ?? 0) === 1
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'
                    }`}
                  >
                    Set as 2nd Ride (Triggers 100% Free!)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = offlineStorage.setBirthdayRidesTodayCount(2);
                      onUpdateProfile(updated);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      (userProfile.birthdayRidesTodayCount ?? 0) >= 2
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    Set as Claimed (Count = 2)
                  </button>
                </div>
              </div>
            </div>

            {/* 50% New Member & New Driver Joining Rewards Card */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-600/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>50% Discount Rewards: New Members & New Drivers</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>New Passengers</span>
                    <span className="text-emerald-400 font-mono">50% OFF</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    New passengers joining Hamba receive an instant 50% discount on their welcome trip across any of the 9 provinces.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>New Drivers</span>
                    <span className="text-amber-400 font-mono">50% OFF FEE</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    New driver partners enjoy 50% off platform commission (pay only 10% vs 20% standard, keeping 90% of earnings) + R500 bonus.
                  </p>
                </div>
              </div>
            </div>

            {/* Mutual Rating Trust Card — Visible to Both Parties */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Mutual Rating Visibility Policy (Both Parties)</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Rider: ★ {userProfile.rating}
                  </span>
                  <span className="text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Driver: ★ 4.96
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Both drivers' ratings and riders' ratings are <strong>100% visible to both parties at all times</strong>: passengers see driver ratings, vehicle plates, and PrDP permits before booking, while drivers see rider ratings on incoming trip requests to maintain mutual safety, accountability, and respect.
              </p>
            </div>

            {/* How Loyalty Points Work in South Africa */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs space-y-1.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>How to Earn Hamba Points</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 leading-relaxed">
                <li>• <strong>Local Rides</strong>: Earn 1 point for every R2.00 spent.</li>
                <li>• <strong>Intercity Travel</strong>: Earn 1.5 points for every R2.00 spent on long-distance corridors.</li>
                <li>• <strong>Remote Offline Bonus</strong>: Earn +25 bonus points when completing navigation in remote areas.</li>
                <li>• <strong>Driver Feedback</strong>: Earn +15 points for rating your driver.</li>
              </ul>
            </div>

            {/* Rewards Catalog / Redeemable Perks */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Redeem Loyalty Points</span>
                <span className="text-[11px] text-amber-400 font-mono">{userProfile.loyaltyPoints} pts available</span>
              </div>

              <div className="space-y-2.5">
                {REWARD_PERK_ITEMS.map((perk) => {
                  const canRedeem = userProfile.loyaltyPoints >= perk.pointsCost;

                  return (
                    <div
                      key={perk.id}
                      className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-3 transition hover:border-slate-600"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{perk.title}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                            R{perk.rewardValueZAR} Value
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {perk.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-amber-400 font-mono mb-1.5">
                          {perk.pointsCost} pts
                        </div>
                        <button
                          onClick={() => handleRedeem(perk)}
                          disabled={!canRedeem}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                            canRedeem
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Trip History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  historyFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Trips ({tripHistory.length})
              </button>
              <button
                onClick={() => setHistoryFilter('ride')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  historyFilter === 'ride' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Local Rides
              </button>
              <button
                onClick={() => setHistoryFilter('intercity')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  historyFilter === 'intercity' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Intercity Shuttles
              </button>
              <button
                onClick={() => setHistoryFilter('delivery')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  historyFilter === 'delivery' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Safe Deliveries
              </button>
            </div>

            {/* History List */}
            {filteredHistory.length > 0 ? (
              <div className="space-y-2.5">
                {filteredHistory.map((trip) => {
                  const pointsEarned = Math.round(
                    (trip.serviceMode === 'intercity' ? trip.estimatedPriceZAR * 0.75 : trip.estimatedPriceZAR / 2) * 1.2
                  );

                  return (
                    <div
                      key={trip.id}
                      className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5 transition hover:border-slate-600"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-700 text-amber-400 flex items-center justify-center shrink-0">
                            {trip.serviceMode === 'intercity' ? (
                              <Bus className="w-4 h-4" />
                            ) : trip.serviceMode === 'delivery' ? (
                              <Package className="w-4 h-4 text-sky-400" />
                            ) : (
                              <Car className="w-4 h-4 text-slate-200" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white capitalize">
                              {trip.category.name}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {trip.status === 'scheduled' 
                                ? `📅 Scheduled: ${trip.scheduledFor?.formattedText || `${trip.scheduledFor?.date} ${trip.scheduledFor?.time}`}`
                                : `${trip.completedAt ? new Date(trip.completedAt).toLocaleDateString('en-ZA') : 'Recent'} · ${trip.distanceKm} km`
                              }
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-white font-mono">
                            R{trip.estimatedPriceZAR}
                          </div>
                          {trip.status === 'scheduled' ? (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                              Upcoming
                            </span>
                          ) : (
                            <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                              +{pointsEarned} pts earned
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Origin & Destination Route */}
                      <div className="p-2.5 rounded-xl bg-slate-900 text-xs space-y-1 border border-slate-800/60">
                        <div className="flex items-center gap-2 text-slate-300 truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{trip.pickup.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">{trip.destination.name}</span>
                        </div>
                      </div>

                      {/* Footer Info: Payment & Re-book */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                        <span>
                          {trip.status === 'scheduled'
                            ? `Payment: ${trip.paymentMethod.toUpperCase()} · Scheduled Reservation`
                            : `Paid via ${trip.paymentMethod.toUpperCase()} · Completed`}
                        </span>
                        {onRebookTrip && (
                          <button
                            onClick={() => onRebookTrip(trip)}
                            className="text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Book Again</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                No trips found in this category. Complete a ride, long-distance trip, or delivery to see it here!
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Points Activity Ledger */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300">Points History & Transactions</div>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="font-semibold text-white truncate">{tx.description}</div>
                    <div className="text-[10px] text-slate-400">{tx.timestamp}</div>
                  </div>
                  <div className={`font-mono font-bold shrink-0 ${
                    tx.pointsDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.pointsDelta > 0 ? `+${tx.pointsDelta}` : tx.pointsDelta} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
