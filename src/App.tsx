/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AppServiceMode, 
  ProvinceId, 
  LocationPoint, 
  RideCategory, 
  PaymentMethod, 
  TripDetails, 
  TripStatus, 
  NavigationStep, 
  DeliveryDetails,
  OfflineMapPack,
  DriverProfile,
  UserProfile,
  ScheduleBookingInfo
} from './types';
import { 
  SA_PROVINCES, 
  ALL_PROVINCIAL_LOCATIONS, 
  NEWCASTLE_LOCATIONS, 
  RIDE_CATEGORIES, 
  SAMPLE_DRIVERS,
  IntercityCorridor
} from './data/provinces';
import { 
  calculateDistanceKm, 
  estimateDurationMinutes, 
  calculateFare, 
  generateRouteCoordinates, 
  generateTurnByTurnSteps,
  calculateBearing
} from './services/navigationEngine';
import { offlineStorage } from './services/offlineStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import { Header } from './components/Header';
import { MapComponent } from './components/MapComponent';
import { RideBookingPanel } from './components/RideBookingPanel';
import { ActiveTripModal } from './components/ActiveTripModal';
import { DriverDashboard } from './components/DriverDashboard';
import { OfflineMapsManager } from './components/OfflineMapsManager';
import { DeliveryBookingPanel } from './components/DeliveryBookingPanel';
import { IntercityBookingPanel } from './components/IntercityBookingPanel';
import { SafetyHubModal } from './components/SafetyHubModal';
import { RewardsProfilePanel } from './components/RewardsProfilePanel';

import { 
  Car, 
  Bus, 
  Package, 
  Map as MapIcon, 
  UserCheck, 
  WifiOff, 
  AlertTriangle,
  Compass,
  Award,
  Sparkles
} from 'lucide-react';

export default function App() {
  const { isOnline, isSimulatedOffline, toggleSimulatedOffline } = useOnlineStatus();

  // Active state
  const [currentMode, setCurrentMode] = useState<AppServiceMode>('ride');
  const [selectedProvinceId, setSelectedProvinceId] = useState<ProvinceId>('kzn');
  
  // Locations based on selected province
  const availableLocations = useMemo(() => {
    return ALL_PROVINCIAL_LOCATIONS.filter((loc) => loc.provinceId === selectedProvinceId);
  }, [selectedProvinceId]);

  // Default Newcastle pickup and destination
  const [pickup, setPickup] = useState<LocationPoint>(NEWCASTLE_LOCATIONS[0]); // Scott St CBD
  const [destination, setDestination] = useState<LocationPoint>(NEWCASTLE_LOCATIONS[1]); // Newcastle Mall
  
  // Update pickup & destination when switching provinces
  const handleProvinceChange = (pId: ProvinceId) => {
    setSelectedProvinceId(pId);
    const provLocs = ALL_PROVINCIAL_LOCATIONS.filter((l) => l.provinceId === pId);
    if (provLocs.length >= 2) {
      setPickup(provLocs[0]);
      setDestination(provLocs[1]);
    } else if (provLocs.length === 1) {
      setPickup(provLocs[0]);
      setDestination(provLocs[0]);
    }
  };

  // Vehicle Category & Payment
  const [selectedCategory, setSelectedCategory] = useState<RideCategory>(RIDE_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  // Active Trip State
  const [activeTrip, setActiveTrip] = useState<TripDetails | null>(null);

  // Driver Mode state
  const [currentDriver, setCurrentDriver] = useState<DriverProfile>(SAMPLE_DRIVERS[0]);
  const [isDriverOnline, setIsDriverOnline] = useState(true);

  // Offline packs
  const [offlinePacks, setOfflinePacks] = useState<OfflineMapPack[]>(() =>
    offlineStorage.getOfflinePacks()
  );

  // Hamba Rewards & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    offlineStorage.getUserProfile()
  );
  const [tripHistory, setTripHistory] = useState<TripDetails[]>(() =>
    offlineStorage.getTripHistory()
  );
  const [scheduledTrips, setScheduledTrips] = useState<TripDetails[]>(() =>
    offlineStorage.getTripHistory().filter((t) => t.status === 'scheduled')
  );
  const [pointsNotification, setPointsNotification] = useState<string | null>(null);

  // Safety Hub Modal
  const [isSafetyHubOpen, setIsSafetyHubOpen] = useState(false);

  // Live Navigation tracking
  const [simStepIndex, setSimStepIndex] = useState(0);

  // Calculate distance, duration, route coordinates and turn-by-turn guidance
  const distanceKm = useMemo(() => {
    return calculateDistanceKm(pickup.lat, pickup.lng, destination.lat, destination.lng);
  }, [pickup, destination]);

  const durationMin = useMemo(() => {
    const isRural = pickup.type === 'rural' || destination.type === 'rural';
    return estimateDurationMinutes(distanceKm, isRural);
  }, [distanceKm, pickup, destination]);

  const estimatedPriceZAR = useMemo(() => {
    return calculateFare(distanceKm, durationMin, selectedCategory);
  }, [distanceKm, durationMin, selectedCategory]);

  const routeCoords = useMemo(() => {
    return generateRouteCoordinates([pickup.lat, pickup.lng], [destination.lat, destination.lng], 32);
  }, [pickup, destination]);

  const navigationSteps = useMemo(() => {
    return generateTurnByTurnSteps(pickup, destination, distanceKm);
  }, [pickup, destination, distanceKm]);

  // Driver vehicle positioning along route during active drive
  const driverPosition = useMemo((): [number, number] | null => {
    if (!activeTrip) return [currentDriver.currentLat, currentDriver.currentLng];
    if (activeTrip.status === 'driver_assigned' || activeTrip.status === 'driver_arriving') {
      // Positioned near pickup
      return [pickup.lat + 0.003, pickup.lng + 0.003];
    }
    if (activeTrip.status === 'in_progress') {
      const idx = Math.min(simStepIndex, routeCoords.length - 1);
      return routeCoords[idx] || [pickup.lat, pickup.lng];
    }
    if (activeTrip.status === 'completed') {
      return [destination.lat, destination.lng];
    }
    return [currentDriver.currentLat, currentDriver.currentLng];
  }, [activeTrip, simStepIndex, routeCoords, pickup, destination, currentDriver]);

  // Compute bearing of vehicle
  const driverBearing = useMemo(() => {
    if (!activeTrip || activeTrip.status !== 'in_progress' || routeCoords.length < 2) return 45;
    const idx = Math.min(simStepIndex, routeCoords.length - 2);
    const p1 = routeCoords[idx];
    const p2 = routeCoords[idx + 1];
    return calculateBearing(p1[0], p1[1], p2[0], p2[1]);
  }, [activeTrip, simStepIndex, routeCoords]);

  const currentNavStep = useMemo(() => {
    if (!navigationSteps || navigationSteps.length === 0) return null;
    const stepIdx = Math.min(
      Math.floor((simStepIndex / (routeCoords.length || 1)) * navigationSteps.length),
      navigationSteps.length - 1
    );
    return navigationSteps[stepIdx];
  }, [simStepIndex, routeCoords, navigationSteps]);

  // Handle Quick Newcastle Presets
  const handleQuickPreset = (destId: string) => {
    const found = NEWCASTLE_LOCATIONS.find((l) => l.id === destId);
    if (found) {
      setDestination(found);
    }
  };

  // Calculate discounts (Birthday Free Ride & 50% New Member Welcome)
  const currentDiscount = useMemo(() => {
    return offlineStorage.calculateTripDiscount(userProfile, estimatedPriceZAR);
  }, [userProfile, estimatedPriceZAR]);

  // Start Ride Request (Immediate or Scheduled)
  const handleRequestRide = (scheduleInfo?: ScheduleBookingInfo) => {
    const finalFare = currentDiscount.finalFareZAR;

    // Handle Scheduled Ride
    if (scheduleInfo?.isScheduled) {
      const scheduledTrip: TripDetails = {
        id: `trip_sched_${Date.now()}`,
        serviceMode: 'ride',
        pickup,
        destination,
        category: selectedCategory,
        estimatedPriceZAR: finalFare,
        originalPriceZAR: estimatedPriceZAR,
        discountApplied: currentDiscount.discountAmountZAR,
        discountType: currentDiscount.discountType,
        riderRating: userProfile.rating,
        driverRating: SAMPLE_DRIVERS[0].rating,
        distanceKm,
        estimatedDurationMin: durationMin,
        paymentMethod: finalFare === 0 ? 'wallet' : paymentMethod,
        safetyOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        status: 'scheduled',
        driver: SAMPLE_DRIVERS[0],
        isOfflineTrip: !isOnline,
        isScheduled: true,
        scheduledFor: {
          date: scheduleInfo.date,
          time: scheduleInfo.time,
          formattedText: scheduleInfo.formattedText,
          note: scheduleInfo.note,
        },
        startedAt: new Date().toISOString(),
      };

      const updatedScheduled = [scheduledTrip, ...scheduledTrips];
      setScheduledTrips(updatedScheduled);

      const updatedHistory = [scheduledTrip, ...tripHistory.filter((t) => t.id !== scheduledTrip.id)];
      setTripHistory(updatedHistory);
      offlineStorage.saveTripHistory(updatedHistory);

      if (currentDiscount.discountType === 'new_member_50') {
        const updatedProf = { ...userProfile, hasUsedWelcomeDiscount: true };
        setUserProfile(updatedProf);
        offlineStorage.saveUserProfile(updatedProf);
      }

      if (!isOnline) {
        offlineStorage.queueOfflineTrip(scheduledTrip);
      }

      setPointsNotification(
        `📅 Ride scheduled for ${scheduleInfo.formattedText || scheduleInfo.date + ' at ' + scheduleInfo.time}! A verified top driver is reserved.`
      );
      return;
    }

    // Immediate ride dispatch
    const newTrip: TripDetails = {
      id: `trip_${Date.now()}`,
      serviceMode: 'ride',
      pickup,
      destination,
      category: selectedCategory,
      estimatedPriceZAR: finalFare,
      originalPriceZAR: estimatedPriceZAR,
      discountApplied: currentDiscount.discountAmountZAR,
      discountType: currentDiscount.discountType,
      riderRating: userProfile.rating,
      driverRating: SAMPLE_DRIVERS[0].rating,
      distanceKm,
      estimatedDurationMin: durationMin,
      paymentMethod: finalFare === 0 ? 'wallet' : paymentMethod,
      safetyOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'requesting',
      driver: SAMPLE_DRIVERS[0],
      isOfflineTrip: !isOnline,
      startedAt: new Date().toISOString(),
    };

    setActiveTrip(newTrip);
    setSimStepIndex(0);

    if (currentDiscount.discountType === 'new_member_50') {
      const updatedProf = { ...userProfile, hasUsedWelcomeDiscount: true };
      setUserProfile(updatedProf);
      offlineStorage.saveUserProfile(updatedProf);
    }

    if (!isOnline) {
      offlineStorage.queueOfflineTrip(newTrip);
    }

    // Auto-progress to driver assigned after 2.5s
    setTimeout(() => {
      setActiveTrip((prev) => (prev ? { ...prev, status: 'driver_assigned', driverEtaMin: 3 } : null));
    }, 2500);
  };

  const handleCancelScheduledTrip = (tripId: string) => {
    setScheduledTrips((prev) => prev.filter((t) => t.id !== tripId));
    const updatedHistory = tripHistory.map((t) =>
      t.id === tripId ? { ...t, status: 'cancelled' as const } : t
    );
    setTripHistory(updatedHistory);
    offlineStorage.saveTripHistory(updatedHistory);
    setPointsNotification('Scheduled ride reservation cancelled.');
  };

  const handleStartScheduledTripNow = (sTrip: TripDetails) => {
    setScheduledTrips((prev) => prev.filter((t) => t.id !== sTrip.id));
    setPickup(sTrip.pickup);
    setDestination(sTrip.destination);
    setSelectedCategory(sTrip.category);

    const activatedTrip: TripDetails = {
      ...sTrip,
      status: 'requesting',
      startedAt: new Date().toISOString(),
    };

    setActiveTrip(activatedTrip);
    setSimStepIndex(0);
    setPointsNotification('Dispatching driver for your reservation now...');

    setTimeout(() => {
      setActiveTrip((prev) => (prev ? { ...prev, status: 'driver_assigned', driverEtaMin: 2 } : null));
    }, 2000);
  };

  // Handle Delivery Request
  const handleRequestDelivery = (details: DeliveryDetails, cat: RideCategory, fareZAR: number) => {
    const newTrip: TripDetails = {
      id: `deliv_${Date.now()}`,
      serviceMode: 'delivery',
      pickup,
      destination,
      category: cat,
      estimatedPriceZAR: fareZAR,
      distanceKm,
      estimatedDurationMin: durationMin,
      paymentMethod,
      safetyOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'driver_assigned',
      driver: SAMPLE_DRIVERS[0],
      deliveryDetails: details,
      isOfflineTrip: !isOnline,
      startedAt: new Date().toISOString(),
    };

    setActiveTrip(newTrip);
    setSimStepIndex(0);
    setCurrentMode('ride'); // view tracking

    if (!isOnline) {
      offlineStorage.queueOfflineTrip(newTrip);
    }
  };

  // Handle Intercity Request
  const handleBookIntercity = (
    corridor: IntercityCorridor,
    tripType: 'shared' | 'private',
    seats: number,
    travelDate: string,
    travelTime: string,
    fareZAR: number
  ) => {
    const intercityCat = tripType === 'shared' ? RIDE_CATEGORIES[6] : RIDE_CATEGORIES[7];

    const newTrip: TripDetails = {
      id: `intercity_${Date.now()}`,
      serviceMode: 'intercity',
      pickup: {
        id: `ic_from_${corridor.id}`,
        name: corridor.from,
        suburbOrDistrict: corridor.from.split('(')[0].trim(),
        provinceId: 'kzn',
        lat: -27.7562,
        lng: 29.9315,
      },
      destination: {
        id: `ic_to_${corridor.id}`,
        name: corridor.to,
        suburbOrDistrict: corridor.to.split('(')[0].trim(),
        provinceId: 'gauteng',
        lat: -26.1076,
        lng: 28.0567,
      },
      category: intercityCat,
      estimatedPriceZAR: fareZAR,
      distanceKm: corridor.distanceKm,
      estimatedDurationMin: Math.round(corridor.estHours * 60),
      paymentMethod,
      safetyOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'driver_assigned',
      driver: SAMPLE_DRIVERS[0],
      intercityDetails: {
        originCity: corridor.from,
        destinationCity: corridor.to,
        corridorHighway: corridor.highway,
        scheduledDate: travelDate,
        scheduledTime: travelTime,
        seatsBooked: seats,
        tollFeesIncluded: true,
        restStopLocations: corridor.restStops,
      },
      isOfflineTrip: !isOnline,
      startedAt: new Date().toISOString(),
    };

    setActiveTrip(newTrip);
    setSimStepIndex(0);
    setCurrentMode('ride'); // show trip tracking HUD

    if (!isOnline) {
      offlineStorage.queueOfflineTrip(newTrip);
    }
  };

  // Advance Simulation Along Route
  const handleAdvanceSimulation = () => {
    if (!activeTrip) return;

    if (activeTrip.status === 'requesting') {
      setActiveTrip({ ...activeTrip, status: 'driver_assigned', driverEtaMin: 2 });
    } else if (activeTrip.status === 'driver_assigned') {
      setActiveTrip({ ...activeTrip, status: 'driver_arriving', driverEtaMin: 1 });
    } else if (activeTrip.status === 'driver_arriving') {
      setActiveTrip({ ...activeTrip, status: 'in_progress' });
      setSimStepIndex(1);
    } else if (activeTrip.status === 'in_progress') {
      if (simStepIndex < routeCoords.length - 4) {
        setSimStepIndex((prev) => prev + 6);
      } else {
        setSimStepIndex(routeCoords.length - 1);
        setActiveTrip({ ...activeTrip, status: 'completed', completedAt: new Date().toISOString() });
      }
    }
  };

  const handleCancelTrip = () => {
    setActiveTrip(null);
    setSimStepIndex(0);
  };

  const handleCompleteTrip = () => {
    if (activeTrip) {
      const completedTrip: TripDetails = {
        ...activeTrip,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };

      const { pointsEarned, updatedProfile } = offlineStorage.addCompletedTrip(completedTrip);
      setUserProfile(updatedProfile);
      setTripHistory(offlineStorage.getTripHistory());
      let toastMsg = `🎉 Trip complete! You earned +${pointsEarned} Hamba Loyalty Points. Balance: ${updatedProfile.loyaltyPoints} pts`;
      if (completedTrip.discountType === 'birthday_free_2nd' || completedTrip.discountType === 'birthday_free') {
        toastMsg = `🎂 Happy Birthday! Your 2nd ride today was 100% FREE on Hamba (Paid in full by app)! +${pointsEarned} pts earned.`;
      } else if (completedTrip.discountType === 'new_member_50') {
        toastMsg = `🎉 Welcome to Hamba! You enjoyed 50% Welcome Discount and earned +${pointsEarned} loyalty points!`;
      }

      setPointsNotification(toastMsg);

      setTimeout(() => {
        setPointsNotification(null);
      }, 5500);
    }

    setActiveTrip(null);
    setSimStepIndex(0);
  };

  const handleRebookTrip = (histTrip: TripDetails) => {
    setPickup(histTrip.pickup);
    setDestination(histTrip.destination);
    setSelectedCategory(histTrip.category);
    setCurrentMode(
      histTrip.serviceMode === 'intercity' ? 'intercity' : histTrip.serviceMode === 'delivery' ? 'delivery' : 'ride'
    );
  };

  // Province Map Center
  const provinceCenter = useMemo(() => {
    const prov = SA_PROVINCES.find((p) => p.id === selectedProvinceId);
    return prov ? prov.defaultCenter : ([-27.7556, 29.9318] as [number, number]);
  }, [selectedProvinceId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Bar Header */}
      <Header
        currentMode={currentMode}
        onModeChange={(m) => setCurrentMode(m)}
        selectedProvince={selectedProvinceId}
        onProvinceChange={handleProvinceChange}
        onOpenSafetyHub={() => setIsSafetyHubOpen(true)}
        isOffline={!isOnline}
        loyaltyPoints={userProfile.loyaltyPoints}
        scheduledCount={scheduledTrips.length}
      />

      {/* Main Workspace Split Screen: Left Sidebar (Controls) + Right Map Stage */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Panel (Responsive width, scrollable) */}
        <aside className="w-full md:w-[420px] lg:w-[460px] xl:w-[500px] h-full flex flex-col shrink-0 z-10 shadow-2xl relative">
          {/* Active Trip takes priority if trip is ongoing and we're in rider or intercity mode */}
          {activeTrip && currentMode !== 'driver' && currentMode !== 'offline_maps' ? (
            <ActiveTripModal
              trip={activeTrip}
              currentStep={currentNavStep}
              onCancelTrip={handleCancelTrip}
              onCompleteTrip={handleCompleteTrip}
              onAdvanceSimulation={handleAdvanceSimulation}
              onTriggerSOS={() => setIsSafetyHubOpen(true)}
              isOffline={!isOnline}
            />
          ) : currentMode === 'ride' ? (
            <RideBookingPanel
              availableLocations={availableLocations}
              pickup={pickup}
              destination={destination}
              onPickupChange={setPickup}
              onDestinationChange={setDestination}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              distanceKm={distanceKm}
              durationMin={durationMin}
              estimatedPriceZAR={estimatedPriceZAR}
              onRequestRide={handleRequestRide}
              isOffline={!isOnline}
              onQuickPreset={handleQuickPreset}
              discountInfo={currentDiscount}
              riderRating={userProfile.rating}
              scheduledTrips={scheduledTrips}
              onCancelScheduledTrip={handleCancelScheduledTrip}
              onStartScheduledTripNow={handleStartScheduledTripNow}
            />
          ) : currentMode === 'delivery' ? (
            <DeliveryBookingPanel
              availableLocations={availableLocations}
              pickup={pickup}
              destination={destination}
              onPickupChange={setPickup}
              onDestinationChange={setDestination}
              distanceKm={distanceKm}
              durationMin={durationMin}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onRequestDelivery={handleRequestDelivery}
              isOffline={!isOnline}
            />
          ) : currentMode === 'intercity' ? (
            <IntercityBookingPanel
              onBookIntercity={handleBookIntercity}
              isOffline={!isOnline}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          ) : currentMode === 'driver' ? (
            <DriverDashboard
              currentDriver={currentDriver}
              isDriverOnline={isDriverOnline}
              onToggleDriverOnline={() => setIsDriverOnline(!isDriverOnline)}
              activeTrip={activeTrip}
              currentStep={currentNavStep}
              onAcceptIncomingRequest={handleRequestRide}
              onAdvanceDriveStep={handleAdvanceSimulation}
              onCompleteDriverTrip={handleCompleteTrip}
              isOffline={!isOnline}
            />
          ) : currentMode === 'offline_maps' ? (
            <OfflineMapsManager
              packs={offlinePacks}
              onUpdatePacks={setOfflinePacks}
              isOffline={!isOnline}
              onToggleOfflineSimulation={toggleSimulatedOffline}
              onClose={() => setCurrentMode('ride')}
            />
          ) : currentMode === 'rewards' ? (
            <RewardsProfilePanel
              userProfile={userProfile}
              tripHistory={tripHistory}
              onUpdateProfile={setUserProfile}
              onRebookTrip={handleRebookTrip}
            />
          ) : null}
        </aside>

        {/* Right Stage: High-Fidelity Interactive Map */}
        <div className="flex-1 h-full relative overflow-hidden">
          {/* Floating Loyalty Points Celebration Toast */}
          {pointsNotification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1500] px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border-2 border-amber-300 animate-bounce">
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{pointsNotification}</span>
            </div>
          )}

          <MapComponent
            center={provinceCenter}
            zoom={selectedProvinceId === 'kzn' ? 13 : 11}
            pickup={pickup}
            destination={destination}
            routeCoords={routeCoords}
            driverPosition={driverPosition}
            driverBearing={driverBearing}
            activeTrip={activeTrip}
            isOffline={!isOnline}
            onMapClick={(lat, lng) => {
              // Clicking anywhere on map adjusts destination
              setDestination({
                id: `custom_${Date.now()}`,
                name: `Custom Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                suburbOrDistrict: 'Map Selected Location',
                provinceId: selectedProvinceId,
                lat,
                lng,
                type: 'commercial',
              });
            }}
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile touch screens <= 768px) */}
      <nav className="md:hidden h-16 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md flex items-center justify-around px-1 shrink-0 z-30 select-none pb-safe">
        <button
          onClick={() => setCurrentMode('ride')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition min-w-[48px] min-h-[44px] ${
            currentMode === 'ride' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Ride</span>
        </button>

        <button
          onClick={() => setCurrentMode('intercity')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition min-w-[48px] min-h-[44px] ${
            currentMode === 'intercity' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Bus className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Intercity</span>
        </button>

        <button
          onClick={() => setCurrentMode('delivery')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition min-w-[48px] min-h-[44px] ${
            currentMode === 'delivery' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Delivery</span>
        </button>

        <button
          onClick={() => setCurrentMode('rewards')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition min-w-[48px] min-h-[44px] ${
            currentMode === 'rewards' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Rewards</span>
        </button>

        <button
          onClick={() => setCurrentMode('offline_maps')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition min-w-[48px] min-h-[44px] ${
            currentMode === 'offline_maps' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Offline</span>
        </button>

        <button
          onClick={() => setCurrentMode('driver')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition min-w-[48px] min-h-[44px] ${
            currentMode === 'driver' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Driver</span>
        </button>
      </nav>

      {/* Emergency Safety SOS Hub Modal */}
      <SafetyHubModal
        isOpen={isSafetyHubOpen}
        onClose={() => setIsSafetyHubOpen(false)}
        currentLocation={pickup}
        activeDriver={activeTrip?.driver || currentDriver}
      />
    </div>
  );
}
