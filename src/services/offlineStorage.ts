import { OfflineMapPack, TripDetails, UserProfile, LoyaltyPointTransaction, RewardPerkItem, LoyaltyTierId } from '../types';
import { INITIAL_OFFLINE_PACKS } from '../data/provinces';
import { INITIAL_USER_PROFILE, INITIAL_TRIP_HISTORY, INITIAL_LOYALTY_TRANSACTIONS } from '../data/rewards';

const STORAGE_KEYS = {
  OFFLINE_PACKS: 'hamba_offline_packs_v1',
  OFFLINE_TRIP_QUEUE: 'hamba_offline_trip_queue_v1',
  SIMULATED_OFFLINE: 'hamba_simulated_offline_v1',
  EMERGENCY_CONTACTS: 'hamba_emergency_contacts_v1',
  OFFLINE_CACHE_STATS: 'hamba_cache_stats_v1',
  USER_PROFILE: 'hamba_user_profile_v1',
  TRIP_HISTORY: 'hamba_trip_history_v1',
  LOYALTY_TRANSACTIONS: 'hamba_loyalty_transactions_v1',
};

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  notifyOnTripStart: boolean;
}

export const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'c1',
    name: 'Thabo Khumalo',
    relation: 'Brother / Next of Kin',
    phone: '+27 72 384 1928',
    notifyOnTripStart: true,
  },
  {
    id: 'c2',
    name: 'Newcastle SAPS Station Commander',
    relation: 'Local Police (Scott St)',
    phone: '10111 / 034 314 6150',
    notifyOnTripStart: false,
  },
];

class OfflineStorageService {
  // Offline Map Packs
  getOfflinePacks(): OfflineMapPack[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_PACKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_OFFLINE_PACKS;
  }

  saveOfflinePacks(packs: OfflineMapPack[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_PACKS, JSON.stringify(packs));
    } catch (err) {
      console.warn('Failed to save offline packs', err);
    }
  }

  updatePackStatus(packId: string, isDownloaded: boolean, progress: number): OfflineMapPack[] {
    const packs = this.getOfflinePacks();
    const updated = packs.map((pack) => {
      if (pack.id === packId) {
        return {
          ...pack,
          isDownloaded,
          downloadProgress: progress,
          lastUpdated: 'Just now',
        };
      }
      return pack;
    });
    this.saveOfflinePacks(updated);
    return updated;
  }

  // Offline Trip Queue for Remote Areas
  getOfflineTripsQueue(): TripDetails[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_TRIP_QUEUE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [];
  }

  queueOfflineTrip(trip: TripDetails): void {
    const queue = this.getOfflineTripsQueue();
    // Prepend new trip
    const updated = [
      {
        ...trip,
        isOfflineTrip: true,
        syncedAt: null,
      },
      ...queue.filter((t) => t.id !== trip.id),
    ];
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_TRIP_QUEUE, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to queue offline trip', err);
    }
  }

  syncAllQueuedTrips(): TripDetails[] {
    const queue = this.getOfflineTripsQueue();
    const synced = queue.map((trip) => ({
      ...trip,
      syncedAt: new Date().toISOString(),
    }));
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_TRIP_QUEUE, JSON.stringify(synced));
    } catch (err) {
      console.warn('Failed to update synced trips', err);
    }
    return synced;
  }

  // Network Simulation (allows testing offline mode at will)
  isSimulatedOffline(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
    } catch {
      return false;
    }
  }

  setSimulatedOffline(isOffline: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, isOffline ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  // Emergency Contacts
  getEmergencyContacts(): EmergencyContact[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONTACTS;
  }

  saveEmergencyContacts(contacts: EmergencyContact[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }

  // Storage metrics (calculates simulated and local cache used)
  getCacheStorageMetrics() {
    const packs = this.getOfflinePacks();
    const downloaded = packs.filter((p) => p.isDownloaded);
    const totalDownloadedMB = downloaded.reduce((acc, p) => acc + p.sizeMB, 0);
    const totalPacks = packs.length;
    const downloadedPacks = downloaded.length;

    return {
      usedMB: Number(totalDownloadedMB.toFixed(1)),
      totalAllocatedMB: 512,
      downloadedPacks,
      totalPacks,
      offlineReady: downloadedPacks > 0,
    };
  }

  // --- Hamba Rewards & Profile Management ---

  getUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE;
  }

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to save user profile', err);
    }
  }

  getTripHistory(): TripDetails[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRIP_HISTORY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_TRIP_HISTORY;
  }

  saveTripHistory(trips: TripDetails[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(trips));
    } catch (err) {
      console.warn('Failed to save trip history', err);
    }
  }

  getLoyaltyTransactions(): LoyaltyPointTransaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOYALTY_TRANSACTIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_LOYALTY_TRANSACTIONS;
  }

  saveLoyaltyTransactions(txs: LoyaltyPointTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOYALTY_TRANSACTIONS, JSON.stringify(txs));
    } catch (err) {
      console.warn('Failed to save loyalty transactions', err);
    }
  }

  calculateTier(points: number): LoyaltyTierId {
    if (points >= 3500) return 'platinum';
    if (points >= 1500) return 'gold';
    if (points >= 500) return 'silver';
    return 'bronze';
  }

  addCompletedTrip(trip: TripDetails): { pointsEarned: number; updatedProfile: UserProfile } {
    const profile = this.getUserProfile();
    const history = this.getTripHistory();
    const transactions = this.getLoyaltyTransactions();

    // Point calculation logic:
    // Base: 1 pt per R2 spent
    let baseRate = trip.estimatedPriceZAR / 2;
    if (trip.serviceMode === 'intercity') {
      baseRate = trip.estimatedPriceZAR * 0.75; // Intercity 1.5x bonus
    }

    // Tier multiplier
    let multiplier = 1.0;
    if (profile.currentTier === 'silver') multiplier = 1.2;
    else if (profile.currentTier === 'gold') multiplier = 1.5;
    else if (profile.currentTier === 'platinum') multiplier = 2.0;

    let pointsEarned = Math.round(baseRate * multiplier);

    // Remote area / offline trip bonus
    if (trip.isOfflineTrip) {
      pointsEarned += 25;
    }

    const newPoints = profile.loyaltyPoints + pointsEarned;
    const newLifetime = profile.lifetimePointsEarned + pointsEarned;
    const newTier = this.calculateTier(newPoints);
    
    // Update birthday rides count if today is birthday
    const isBirthday = this.isUserBirthdayToday(profile.birthDate);
    const newBirthdayCount = isBirthday 
      ? (profile.birthdayRidesTodayCount ?? 0) + 1 
      : (profile.birthdayRidesTodayCount ?? 0);

    const updatedProfile: UserProfile = {
      ...profile,
      totalTripsCount: profile.totalTripsCount + 1,
      loyaltyPoints: newPoints,
      lifetimePointsEarned: newLifetime,
      currentTier: newTier,
      birthdayRidesTodayCount: newBirthdayCount,
      hasUsedWelcomeDiscount: trip.discountType === 'new_member_50' ? true : profile.hasUsedWelcomeDiscount,
    };

    // New transaction
    const newTx: LoyaltyPointTransaction = {
      id: `tx_${Date.now()}`,
      tripId: trip.id,
      description: `Points earned: ${trip.pickup.name} ➔ ${trip.destination.name} (R${trip.estimatedPriceZAR})`,
      pointsDelta: pointsEarned,
      timestamp: 'Just now',
      type: trip.serviceMode === 'intercity' ? 'intercity_bonus' : trip.serviceMode === 'delivery' ? 'delivery_earned' : 'ride_earned',
    };

    // Update history with completed trip
    const updatedHistory = [trip, ...history.filter((t) => t.id !== trip.id)];

    this.saveUserProfile(updatedProfile);
    this.saveTripHistory(updatedHistory);
    this.saveLoyaltyTransactions([newTx, ...transactions]);

    return { pointsEarned, updatedProfile };
  }

  redeemPerk(perk: RewardPerkItem): { success: boolean; message: string; updatedProfile?: UserProfile } {
    const profile = this.getUserProfile();

    if (profile.loyaltyPoints < perk.pointsCost) {
      return {
        success: false,
        message: `Insufficient loyalty points. You need ${perk.pointsCost} pts but currently have ${profile.loyaltyPoints} pts.`,
      };
    }

    const remainingPoints = profile.loyaltyPoints - perk.pointsCost;
    const newTier = this.calculateTier(remainingPoints);

    let updatedWallet = profile.walletBalanceZAR;
    if (perk.category === 'wallet_credit') {
      updatedWallet += perk.rewardValueZAR;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      loyaltyPoints: remainingPoints,
      currentTier: newTier,
      walletBalanceZAR: updatedWallet,
    };

    const newTx: LoyaltyPointTransaction = {
      id: `tx_red_${Date.now()}`,
      description: `Redeemed: ${perk.title}`,
      pointsDelta: -perk.pointsCost,
      timestamp: 'Just now',
      type: 'redemption',
    };

    const transactions = this.getLoyaltyTransactions();
    this.saveUserProfile(updatedProfile);
    this.saveLoyaltyTransactions([newTx, ...transactions]);

    return {
      success: true,
      message: `Successfully redeemed ${perk.title}! ${
        perk.category === 'wallet_credit' ? `R${perk.rewardValueZAR} has been credited to your Hamba Wallet.` : 'Voucher active in your profile.'
      }`,
      updatedProfile,
    };
  }

  // Check if today is the user's birthday (South Africa local time)
  isUserBirthdayToday(birthDateStr?: string): boolean {
    if (!birthDateStr) return false;
    try {
      const parts = birthDateStr.split('-');
      if (parts.length < 3) return false;
      const birthMonth = parseInt(parts[1], 10);
      const birthDay = parseInt(parts[2], 10);

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();

      return birthMonth === currentMonth && birthDay === currentDay;
    } catch {
      return false;
    }
  }

  // Set birthday rides taken today (for interactive testing / simulation)
  setBirthdayRidesTodayCount(count: number): UserProfile {
    const profile = this.getUserProfile();
    const updated: UserProfile = {
      ...profile,
      birthdayRidesTodayCount: count,
    };
    this.saveUserProfile(updated);
    return updated;
  }

  // Calculate discounts: 50% discount for new members & Free rides for 2nd request on birthday (paid by Hamba app)
  calculateTripDiscount(
    profile: UserProfile,
    rawFareZAR: number
  ): {
    finalFareZAR: number;
    discountAmountZAR: number;
    discountType: 'none' | 'new_member_50' | 'birthday_free_2nd' | 'birthday_first_ride';
    tagline: string;
  } {
    const isBirthdayToday = this.isUserBirthdayToday(profile.birthDate);
    const birthdayRides = profile.birthdayRidesTodayCount ?? 0;

    // 1. Birthday Free Ride Perk — 100% Free for riders requesting for the SECOND time on the same day of their birthday!
    // Paid in full by the Hamba app directly to the driver
    if (isBirthdayToday && birthdayRides === 1) {
      return {
        finalFareZAR: 0,
        discountAmountZAR: rawFareZAR,
        discountType: 'birthday_free_2nd',
        tagline: '🎂 Happy Birthday! Your 2nd ride today is 100% FREE — Paid in full by Hamba App',
      };
    }

    // 2. Birthday 1st Ride Notice (Leading up to the free 2nd ride)
    if (isBirthdayToday && birthdayRides === 0) {
      if (profile.isNewMember && !profile.hasUsedWelcomeDiscount) {
        const discount = Math.round(rawFareZAR * 0.5);
        return {
          finalFareZAR: Math.max(1, rawFareZAR - discount),
          discountAmountZAR: discount,
          discountType: 'new_member_50',
          tagline: '🎂 Birthday Ride 1 of 2 + 50% New Member Discount! (Your 2nd ride today is 100% FREE!)',
        };
      }
      return {
        finalFareZAR: rawFareZAR,
        discountAmountZAR: 0,
        discountType: 'birthday_first_ride',
        tagline: '🎂 Birthday Special (Ride 1 of 2): Complete this ride and your 2nd birthday ride today is 100% FREE!',
      };
    }

    // 3. New Member 50% Welcome Discount (for new passengers joining Hamba)
    if (profile.isNewMember && !profile.hasUsedWelcomeDiscount) {
      const discount = Math.round(rawFareZAR * 0.5);
      return {
        finalFareZAR: Math.max(1, rawFareZAR - discount),
        discountAmountZAR: discount,
        discountType: 'new_member_50',
        tagline: '🎉 50% New Member Welcome Discount Applied',
      };
    }

    return {
      finalFareZAR: rawFareZAR,
      discountAmountZAR: 0,
      discountType: 'none',
      tagline: '',
    };
  }

  // Update mutual ratings after trip
  updateMutualRatings(
    tripId: string,
    riderRatingForDriver?: number,
    driverRatingForRider?: number
  ): { updatedHistory: TripDetails[]; updatedProfile: UserProfile } {
    const history = this.getTripHistory();
    const profile = this.getUserProfile();

    const updatedHistory = history.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          ratingGivenByRider: riderRatingForDriver
            ? { stars: riderRatingForDriver, comment: 'Punctual & safe driving' }
            : t.ratingGivenByRider,
          ratingGivenByDriver: driverRatingForRider
            ? { stars: driverRatingForRider, comment: 'Polite and ready on time' }
            : t.ratingGivenByDriver,
        };
      }
      return t;
    });

    let updatedProfile = profile;
    if (driverRatingForRider) {
      // Recalculate rider's average rating
      const newRating = Number(((profile.rating * 14 + driverRatingForRider) / 15).toFixed(2));
      updatedProfile = {
        ...profile,
        rating: newRating,
      };
      this.saveUserProfile(updatedProfile);
    }

    this.saveTripHistory(updatedHistory);
    return { updatedHistory, updatedProfile };
  }
}

export const offlineStorage = new OfflineStorageService();

