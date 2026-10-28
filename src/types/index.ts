export type ProvinceId = 
  | 'kzn' 
  | 'gauteng' 
  | 'western_cape' 
  | 'eastern_cape' 
  | 'free_state' 
  | 'limpopo' 
  | 'mpumalanga' 
  | 'north_west' 
  | 'northern_cape';

export interface LocationPoint {
  id: string;
  name: string;
  suburbOrDistrict: string;
  provinceId: ProvinceId;
  lat: number;
  lng: number;
  isPopular?: boolean;
  type?: 'residential' | 'commercial' | 'hospital' | 'transit' | 'industrial' | 'rural';
}

export type AppServiceMode = 'ride' | 'intercity' | 'delivery' | 'driver' | 'offline_maps' | 'safety' | 'rewards';

export type LoyaltyTierId = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTier {
  id: LoyaltyTierId;
  name: string;
  indigenousName: string; // e.g. Umhambi
  minPoints: number;
  maxPoints: number;
  discountPercentage: number;
  perks: string[];
  badgeColor: string;
}

export interface LoyaltyPointTransaction {
  id: string;
  tripId?: string;
  description: string;
  pointsDelta: number;
  timestamp: string;
  type: 'ride_earned' | 'intercity_bonus' | 'delivery_earned' | 'review_bonus' | 'redemption';
}

export interface RewardPerkItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  rewardValueZAR: number;
  category: 'wallet_credit' | 'ride_discount' | 'road_trip_perk' | 'delivery_waiver';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalTripsCount: number;
  loyaltyPoints: number;
  lifetimePointsEarned: number;
  currentTier: LoyaltyTierId;
  walletBalanceZAR: number;
  birthDate: string; // YYYY-MM-DD
  isNewMember: boolean;
  hasUsedWelcomeDiscount: boolean;
  memberJoinedDate: string;
  birthdayRidesTodayCount: number; // Count of rides today on birthday (2nd ride is 100% FREE!)
}



export type RideCategoryId = 
  | 'hamba_go' 
  | 'hamba_comfort' 
  | 'hamba_bakkie' 
  | 'hamba_safe' 
  | 'hamba_shared'
  | 'hamba_intercity_shuttle'
  | 'hamba_intercity_private'
  | 'hamba_food_delivery'
  | 'hamba_parcel_express';

export type DeliveryItemCategory = 
  | 'food_meals' 
  | 'groceries' 
  | 'documents_parcels' 
  | 'pharmacy_meds' 
  | 'electronics_parts';

export interface DeliveryDetails {
  itemCategory: DeliveryItemCategory;
  itemDescription: string;
  recipientName: string;
  recipientPhone: string;
  weightKg: number;
  isInsulatedBagRequired: boolean;
  viewObstructionCompliant: boolean; // Confirmed stowed in boot/footwell below window lines
  deliveryNotes?: string;
  proofOfDeliveryPhotoUrl?: string;
}

export interface IntercityTripDetails {
  originCity: string;
  destinationCity: string;
  corridorHighway: string; // e.g. N11, N3, N1
  scheduledDate: string;
  scheduledTime: string;
  seatsBooked: number;
  tollFeesIncluded: boolean;
  restStopLocations: string[];
}

export interface RideCategory {
  id: RideCategoryId;
  name: string;
  tagline: string;
  vehicleExample: string;
  baseFareZAR: number;
  perKmZAR: number;
  perMinuteZAR: number;
  passengerCapacity: number;
  luggageCapacity: string;
  iconName: string;
  idealFor: string;
  isDeliveryOnly?: boolean;
  isIntercityOnly?: boolean;
}

export type PaymentMethod = 'cash' | 'ozow' | 'card' | 'wallet';

export interface DriverProfile {
  id: string;
  name: string;
  photoUrl: string;
  phone: string;
  rating: number;
  totalTrips: number;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  prdpVerified: boolean;
  licenceDiscExpiry: string;
  currentLat: number;
  currentLng: number;
  isFemaleOnlyVerified?: boolean;
}

export type TripStatus = 
  | 'idle' 
  | 'scheduled'
  | 'requesting' 
  | 'driver_assigned' 
  | 'driver_arriving' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface ScheduleBookingInfo {
  isScheduled: boolean;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  formattedText?: string;
  note?: string;
}

export interface TripDetails {
  id: string;
  serviceMode: AppServiceMode;
  pickup: LocationPoint;
  destination: LocationPoint;
  category: RideCategory;
  estimatedPriceZAR: number;
  distanceKm: number;
  estimatedDurationMin: number;
  paymentMethod: PaymentMethod;
  safetyOtp: string;
  status: TripStatus;
  driver?: DriverProfile;
  driverEtaMin?: number;
  isOfflineTrip?: boolean;
  syncedAt?: string | null;
  startedAt?: string;
  completedAt?: string;
  deliveryDetails?: DeliveryDetails;
  intercityDetails?: IntercityTripDetails;
  originalPriceZAR?: number;
  discountApplied?: number;
  discountType?: 'none' | 'new_member_50' | 'birthday_free' | 'birthday_free_2nd' | 'birthday_first_ride';
  riderRating?: number;
  driverRating?: number;
  ratingGivenByRider?: { stars: number; comment?: string; tags?: string[] };
  ratingGivenByDriver?: { stars: number; comment?: string };
  isScheduled?: boolean;
  scheduledFor?: {
    date: string;
    time: string;
    formattedText?: string;
    note?: string;
  };
}


export interface OfflineMapPack {
  id: string;
  name: string;
  region: string;
  provinceId: ProvinceId;
  sizeMB: number;
  isDownloaded: boolean;
  downloadProgress: number; // 0 - 100
  lastUpdated: string;
  description: string;
  features: string[];
}

export interface RoadHazardAlert {
  id: string;
  type: 'pothole' | 'livestock' | 'unpaved_gravel' | 'robot_outage' | 'poor_signal';
  title: string;
  description: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  turnDirection: 'straight' | 'left' | 'right' | 'slight_left' | 'slight_right' | 'roundabout' | 'arrive';
  roadName: string;
  speedLimitKmh: number;
  surfaceType: 'paved' | 'gravel';
}
