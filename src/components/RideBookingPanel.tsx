import React, { useState, useMemo } from 'react';
import { LocationPoint, RideCategory, PaymentMethod, RideCategoryId, ScheduleBookingInfo, TripDetails } from '../types';
import { RIDE_CATEGORIES, SAMPLE_DRIVERS } from '../data/provinces';
import { 
  MapPin, 
  Navigation, 
  Car, 
  ShieldCheck, 
  Truck, 
  Users, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Wallet,
  Clock,
  ArrowRight,
  Sparkles,
  WifiOff,
  Calendar,
  CalendarClock,
  CalendarDays,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RideBookingPanelProps {
  availableLocations: LocationPoint[];
  pickup: LocationPoint;
  destination: LocationPoint;
  onPickupChange: (loc: LocationPoint) => void;
  onDestinationChange: (loc: LocationPoint) => void;
  selectedCategory: RideCategory;
  onCategorySelect: (cat: RideCategory) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  distanceKm: number;
  durationMin: number;
  estimatedPriceZAR: number;
  onRequestRide: (scheduleInfo?: ScheduleBookingInfo) => void;
  isOffline: boolean;
  onQuickPreset: (destId: string) => void;
  discountInfo?: {
    finalFareZAR: number;
    discountAmountZAR: number;
    discountType: 'none' | 'new_member_50' | 'birthday_free' | 'birthday_free_2nd' | 'birthday_first_ride';
    tagline: string;
  };
  riderRating?: number;
  scheduledTrips?: TripDetails[];
  onCancelScheduledTrip?: (tripId: string) => void;
  onStartScheduledTripNow?: (trip: TripDetails) => void;
}

export const RideBookingPanel: React.FC<RideBookingPanelProps> = ({
  availableLocations,
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  selectedCategory,
  onCategorySelect,
  paymentMethod,
  onPaymentMethodChange,
  distanceKm,
  durationMin,
  estimatedPriceZAR,
  onRequestRide,
  isOffline,
  onQuickPreset,
  discountInfo,
  riderRating = 4.98,
  scheduledTrips = [],
  onCancelScheduledTrip,
  onStartScheduledTripNow,
}) => {
  const [showLocationPicker, setShowLocationPicker] = useState<'pickup' | 'dest' | null>(null);

  // Booking mode: 'now' (instant dispatch) or 'schedule' (future reservation)
  const [bookingMode, setBookingMode] = useState<'now' | 'schedule'>('now');

  // Scheduling states
  const initialSchedule = useMemo(() => {
    const now = new Date();
    // Default to ~35 mins ahead rounded to next 5 minutes
    const future = new Date(now.getTime() + 35 * 60 * 1000);
    const roundedMin = Math.ceil(future.getMinutes() / 5) * 5;
    future.setMinutes(roundedMin);
    future.setSeconds(0);

    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    const hh = String(future.getHours()).padStart(2, '0');
    const min = String(future.getMinutes()).padStart(2, '0');

    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
    };
  }, []);

  const [scheduledDate, setScheduledDate] = useState<string>(initialSchedule.date);
  const [scheduledTime, setScheduledTime] = useState<string>(initialSchedule.time);
  const [driverNote, setDriverNote] = useState<string>('');
  const [showScheduledList, setShowScheduledList] = useState<boolean>(true);

  // Date boundaries
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // 30 days ahead
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Check if chosen time is at least 5 minutes in future
  const isScheduleValid = useMemo(() => {
    if (bookingMode !== 'schedule') return true;
    try {
      const chosen = new Date(`${scheduledDate}T${scheduledTime}:00`);
      const minAllowed = new Date(Date.now() + 5 * 60 * 1000);
      return chosen.getTime() >= minAllowed.getTime();
    } catch {
      return false;
    }
  }, [bookingMode, scheduledDate, scheduledTime]);

  // Friendly formatted text (e.g. "Tomorrow at 07:00" or "Today at 16:30")
  const friendlyScheduleText = useMemo(() => {
    try {
      const chosen = new Date(`${scheduledDate}T${scheduledTime}:00`);
      const today = new Date();
      const isToday = today.toDateString() === chosen.toDateString();

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const isTomorrow = tomorrow.toDateString() === chosen.toDateString();

      if (isToday) return `Today at ${scheduledTime}`;
      if (isTomorrow) return `Tomorrow at ${scheduledTime}`;

      const formatted = chosen.toLocaleDateString('en-ZA', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
      return `${formatted} at ${scheduledTime}`;
    } catch {
      return `${scheduledDate} at ${scheduledTime}`;
    }
  }, [scheduledDate, scheduledTime]);

  // Quick preset helper
  const applyTimeOffset = (minutesAhead: number) => {
    const target = new Date(Date.now() + minutesAhead * 60 * 1000);
    const roundedMin = Math.ceil(target.getMinutes() / 5) * 5;
    target.setMinutes(roundedMin);
    target.setSeconds(0);

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const hh = String(target.getHours()).padStart(2, '0');
    const min = String(target.getMinutes()).padStart(2, '0');

    setScheduledDate(`${yyyy}-${mm}-${dd}`);
    setScheduledTime(`${hh}:${min}`);
  };

  const applyTomorrowAt = (hour: number, minute: number) => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(hour, minute, 0, 0);

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const hh = String(target.getHours()).padStart(2, '0');
    const min = String(target.getMinutes()).padStart(2, '0');

    setScheduledDate(`${yyyy}-${mm}-${dd}`);
    setScheduledTime(`${hh}:${min}`);
  };

  const handleBookingSubmit = () => {
    if (bookingMode === 'schedule') {
      if (!isScheduleValid) return;
      onRequestRide({
        isScheduled: true,
        date: scheduledDate,
        time: scheduledTime,
        formattedText: friendlyScheduleText,
        note: driverNote.trim() || undefined,
      });
    } else {
      onRequestRide();
    }
  };

  const getVehicleIcon = (catId: RideCategoryId) => {
    switch (catId) {
      case 'hamba_bakkie':
        return <Truck className="w-5 h-5" />;
      case 'hamba_safe':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'hamba_shared':
        return <Users className="w-5 h-5 text-sky-400" />;
      case 'hamba_comfort':
        return <Car className="w-5 h-5 text-amber-400" />;
      case 'hamba_go':
      default:
        return <Car className="w-5 h-5 text-slate-200" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80 text-slate-100 overflow-y-auto">
      {/* Pickup & Destination Selector */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Where are we going?</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-300 font-bold bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700" title="Your passenger rating visible to drivers">
              ★ {riderRating} Rider Rating
            </span>
            {isOffline && (
              <span className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                <WifiOff className="w-3 h-3" />
                Offline Ready
              </span>
            )}
          </div>
        </div>

        {/* Mutual Rating Transparency Banner */}
        <div className="mb-3 p-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-slate-300 text-[11px]">
              <strong className="text-white">Mutual Ratings Active:</strong> Both parties see ratings
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">You: ★{riderRating}</span>
            <span className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Driver: ★4.96</span>
          </div>
        </div>

        {/* Promo / Birthday / 50% Welcome Banner */}
        {discountInfo && discountInfo.discountType !== 'none' && (
          <div className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
            discountInfo.discountType === 'birthday_free_2nd' || discountInfo.discountType === 'birthday_free'
              ? 'bg-gradient-to-r from-amber-500/25 via-purple-500/25 to-pink-500/25 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/40'
              : discountInfo.discountType === 'birthday_first_ride'
              ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
              : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
          }`}>
            <span className="font-semibold">{discountInfo.tagline}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 font-bold font-mono shrink-0 ml-2">
              {discountInfo.discountType === 'birthday_free_2nd' || discountInfo.discountType === 'birthday_free' 
                ? 'R0 FARE (100% FREE)' 
                : discountInfo.discountType === 'birthday_first_ride'
                ? '1st Ride'
                : '-50% OFF'}
            </span>
          </div>
        )}

        <div className="space-y-2 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-slate-700 pointer-events-none" />

          {/* Pickup Input */}
          <div className="relative">
            <button
              onClick={() => setShowLocationPicker(showLocationPicker === 'pickup' ? null : 'pickup')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition text-left"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shrink-0 z-10" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-400">Pickup Location</div>
                <div className="text-sm font-semibold truncate text-slate-100">{pickup.name}</div>
              </div>
            </button>

            {showLocationPicker === 'pickup' && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1">
                {availableLocations.map((loc) => (
                  <button
                    key={`p-${loc.id}`}
                    onClick={() => {
                      onPickupChange(loc);
                      setShowLocationPicker(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between ${
                      pickup.id === loc.id ? 'bg-amber-500/20 text-amber-300' : 'text-slate-200 hover:bg-slate-700/70'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{loc.name}</span>
                      <span className="text-[11px] text-slate-400">{loc.suburbOrDistrict}</span>
                    </div>
                    {loc.isPopular && <span className="text-[10px] text-amber-400">Popular</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div className="relative">
            <button
              onClick={() => setShowLocationPicker(showLocationPicker === 'dest' ? null : 'dest')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition text-left"
            >
              <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900 shrink-0 z-10" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-400">Destination</div>
                <div className="text-sm font-semibold truncate text-slate-100">{destination.name}</div>
              </div>
            </button>

            {showLocationPicker === 'dest' && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1">
                {availableLocations.map((loc) => (
                  <button
                    key={`d-${loc.id}`}
                    onClick={() => {
                      onDestinationChange(loc);
                      setShowLocationPicker(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between ${
                      destination.id === loc.id ? 'bg-amber-500/20 text-amber-300' : 'text-slate-200 hover:bg-slate-700/70'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{loc.name}</span>
                      <span className="text-[11px] text-slate-400">{loc.suburbOrDistrict}</span>
                    </div>
                    {loc.isPopular && <span className="text-[10px] text-amber-400">Popular</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick presets for Newcastle hotspots */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">Newcastle shortcuts:</span>
          <button
            onClick={() => onQuickPreset('nc_mall_blackrock')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] whitespace-nowrap text-slate-300 transition cursor-pointer"
          >
            Newcastle Mall
          </button>
          <button
            onClick={() => onQuickPreset('nc_madadeni_hospital')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] whitespace-nowrap text-slate-300 transition cursor-pointer"
          >
            Madadeni Hospital
          </button>
          <button
            onClick={() => onQuickPreset('nc_osizweni_centre')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] whitespace-nowrap text-slate-300 transition cursor-pointer"
          >
            Osizweni
          </button>
          <button
            onClick={() => onQuickPreset('nc_normandien')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] whitespace-nowrap text-amber-400 transition cursor-pointer"
          >
            Normandien (Gravel/Rural)
          </button>
        </div>
      </div>

      {/* Booking Mode Selector: Ride Now vs Schedule */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
        <div className="text-xs text-slate-400 mb-2 font-medium">When do you want to ride?</div>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setBookingMode('now')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
              bookingMode === 'now'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Ride Now</span>
            <span className="text-[10px] opacity-75 font-mono">~3m</span>
          </button>

          <button
            type="button"
            onClick={() => setBookingMode('schedule')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
              bookingMode === 'schedule'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Schedule for Later</span>
          </button>
        </div>

        {/* Expandable Scheduling Details when "Schedule for Later" is selected */}
        {bookingMode === 'schedule' && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <CalendarDays className="w-4 h-4" />
                <span>Reserve Trip in Advance</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                Locked-in Fare Guarantee
              </span>
            </div>

            {/* Date & Time Input Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduledDate}
                    min={todayDateStr}
                    max={maxDateStr}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Quick Timing Shortcut Presets */}
            <div>
              <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Quick schedule presets:</span>
                <span className="text-amber-300 font-mono text-[10px]">{friendlyScheduleText}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTimeOffset(15)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  +15 min
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeOffset(30)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  +30 min
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeOffset(60)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  +1 hour
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeOffset(120)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  +2 hours
                </button>
                <button
                  type="button"
                  onClick={() => applyTomorrowAt(7, 0)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-amber-300 hover:text-amber-200 transition cursor-pointer"
                >
                  Tmw 07:00
                </button>
                <button
                  type="button"
                  onClick={() => applyTomorrowAt(17, 30)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-amber-300 hover:text-amber-200 transition cursor-pointer"
                >
                  Tmw 17:30
                </button>
              </div>
            </div>

            {/* Optional driver note */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Driver Note (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Early morning flight, Gate 4 access code, luggage assistance"
                value={driverNote}
                onChange={(e) => setDriverNote(e.target.value)}
                maxLength={80}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Validation warning if in past */}
            {!isScheduleValid ? (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Please select a departure time at least 5 minutes in the future.</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 text-[10px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Reliability Promise:</strong> A verified top-rated driver is assigned 15 mins prior. Free cancellation up to 30 mins before pickup.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Scheduled Reservations List (if user has scheduled rides) */}
      {scheduledTrips.length > 0 && (
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <button
            type="button"
            onClick={() => setShowScheduledList(!showScheduledList)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-400" />
              <span>Your Scheduled Rides</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                {scheduledTrips.length}
              </span>
            </div>
            {showScheduledList ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showScheduledList && (
            <div className="mt-2.5 space-y-2">
              {scheduledTrips.map((sTrip) => (
                <div
                  key={sTrip.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {sTrip.scheduledFor?.formattedText || `${sTrip.scheduledFor?.date} ${sTrip.scheduledFor?.time}`}
                    </span>
                    <span className="font-mono font-bold text-white">R{sTrip.estimatedPriceZAR}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="truncate">{sTrip.pickup.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span className="truncate">{sTrip.destination.name}</span>
                    </div>
                  </div>

                  {sTrip.scheduledFor?.note && (
                    <div className="text-[10px] text-slate-400 italic bg-slate-950 px-2 py-1 rounded border border-slate-800 truncate">
                      "{sTrip.scheduledFor.note}"
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">{sTrip.category.name}</span>
                    <div className="flex items-center gap-2">
                      {onCancelScheduledTrip && (
                        <button
                          type="button"
                          onClick={() => onCancelScheduledTrip(sTrip.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      )}
                      {onStartScheduledTripNow && (
                        <button
                          type="button"
                          onClick={() => onStartScheduledTripNow(sTrip)}
                          className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vehicle Categories */}
      <div className="p-4 sm:p-5 flex-1 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Choose vehicle type</span>
          <span className="font-mono">{distanceKm} km · ~{durationMin} mins</span>
        </div>

        <div className="space-y-2.5">
          {RIDE_CATEGORIES.filter((c) => !c.isDeliveryOnly && !c.isIntercityOnly).map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            const fare = Math.round(cat.baseFareZAR + distanceKm * cat.perKmZAR + durationMin * cat.perMinuteZAR);

            return (
              <div
                key={cat.id}
                onClick={() => onCategorySelect(cat)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/60 text-slate-300'}`}>
                      {getVehicleIcon(cat.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{cat.name}</span>
                        {cat.id === 'hamba_safe' && (
                          <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                            Female Only / SAPS
                          </span>
                        )}
                        {cat.id === 'hamba_bakkie' && (
                          <span className="text-[10px] bg-amber-950 border border-amber-500/40 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                            Rough Terrain / Gravel
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{cat.tagline}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm font-mono">R{fare}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{bookingMode === 'schedule' ? 'Reserved' : '3 min away'}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">{cat.idealFor}</span>
                    <span className="font-medium text-amber-300">{cat.luggageCapacity}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="pt-2">
          <div className="text-xs text-slate-400 mb-2">Payment Option</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onPaymentMethodChange('cash')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Cash to Driver</span>
            </button>

            <button
              onClick={() => onPaymentMethodChange('ozow')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition cursor-pointer ${
                paymentMethod === 'ozow'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Ozow / Instant EFT</span>
            </button>

            <button
              onClick={() => onPaymentMethodChange('card')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition cursor-pointer ${
                paymentMethod === 'card'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <CreditCard className="w-4 h-4 text-sky-400" />
              <span>Bank Card (Capitec/FNB)</span>
            </button>

            <button
              onClick={() => onPaymentMethodChange('wallet')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition cursor-pointer ${
                paymentMethod === 'wallet'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Wallet className="w-4 h-4 text-purple-400" />
              <span>Hamba Wallet (R240)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Booking Action */}
      <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 sticky bottom-0 z-20">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div>
            <div className="text-slate-400">
              {bookingMode === 'schedule' ? 'Locked-in Reservation Fare' : 'Total estimated fare'}
            </div>
            {(discountInfo?.discountType === 'birthday_free_2nd' || discountInfo?.discountType === 'birthday_free') && (
              <span className="text-[10px] text-amber-300 font-bold">100% Free 2nd Birthday Ride (Covered by Hamba)</span>
            )}
            {discountInfo?.discountType === 'birthday_first_ride' && (
              <span className="text-[10px] text-amber-400 font-bold">Birthday Ride 1 of 2 (2nd ride today is 100% FREE!)</span>
            )}
            {discountInfo?.discountType === 'new_member_50' && (
              <span className="text-[10px] text-emerald-300 font-bold">50% Welcome Member Discount Applied</span>
            )}
          </div>
          <div className="text-right">
            {discountInfo && discountInfo.discountType !== 'none' && (
              <div className="text-xs line-through text-slate-500 font-mono">R{estimatedPriceZAR}</div>
            )}
            <div className="text-xl font-extrabold text-white font-mono">
              R{discountInfo ? discountInfo.finalFareZAR : estimatedPriceZAR}
            </div>
          </div>
        </div>

        <button
          onClick={handleBookingSubmit}
          disabled={bookingMode === 'schedule' && !isScheduleValid}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-[0.98] ${
            bookingMode === 'schedule' && !isScheduleValid
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {bookingMode === 'schedule' ? (
            <>
              <CalendarClock className="w-4 h-4" />
              <span>
                Schedule for {friendlyScheduleText} • R{discountInfo ? discountInfo.finalFareZAR : estimatedPriceZAR}
              </span>
            </>
          ) : (
            <>
              <span>
                Book {selectedCategory.name} {
                  (discountInfo?.discountType === 'birthday_free_2nd' || discountInfo?.discountType === 'birthday_free') 
                    ? '(100% FREE • R0.00)' 
                    : discountInfo?.discountType === 'new_member_50'
                    ? '(50% OFF)'
                    : ''
                }
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          Mutual Ratings: Rider ★{riderRating} · Driver ★{SAMPLE_DRIVERS[0].rating} · 10111 SAPS
        </p>
      </div>
    </div>
  );
};
