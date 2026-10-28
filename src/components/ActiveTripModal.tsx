import React, { useState } from 'react';
import { TripDetails, NavigationStep } from '../types';
import { 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Share2, 
  Mic, 
  MicOff, 
  AlertOctagon, 
  CheckCircle2, 
  Navigation,
  Compass,
  WifiOff,
  Zap,
  FastForward,
  X,
  Star
} from 'lucide-react';

interface ActiveTripModalProps {
  trip: TripDetails;
  currentStep: NavigationStep | null;
  onCancelTrip: () => void;
  onCompleteTrip: () => void;
  onAdvanceSimulation: () => void;
  onTriggerSOS: () => void;
  isOffline: boolean;
}

export const ActiveTripModal: React.FC<ActiveTripModalProps> = ({
  trip,
  currentStep,
  onCancelTrip,
  onCompleteTrip,
  onAdvanceSimulation,
  onTriggerSOS,
  isOffline,
}) => {
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [selectedTag, setSelectedTag] = useState('Safe & Smooth Driver');

  const driver = trip.driver;

  const handleShareTrip = () => {
    const shareText = `I'm riding with Hamba in ${trip.pickup.suburbOrDistrict}. Driver: ${driver?.name || 'Local Driver'} (${driver?.vehicleModel || 'Hamba Car'}, Plate: ${driver?.vehiclePlate || 'NN'}). Destination: ${trip.destination.name}. PIN: ${trip.safetyOtp}. Tracking link: https://hamba.co.za/track/${trip.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Header status bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {trip.status === 'requesting' && 'Searching Local Drivers in Amajuba...'}
              {trip.status === 'driver_assigned' && 'Driver Assigned · En Route'}
              {trip.status === 'driver_arriving' && 'Driver Arriving in 2 Mins'}
              {trip.status === 'in_progress' && 'Trip In Progress'}
              {trip.status === 'completed' && 'Trip Completed Successfully'}
            </span>
          </div>

          {isOffline && (
            <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md">
              <WifiOff className="w-3 h-3" />
              Offline Tracked
            </span>
          )}
        </div>

        {/* Turn-by-Turn Cue if In Progress */}
        {trip.status === 'in_progress' && currentStep && (
          <div className="mt-3 p-3 rounded-xl bg-slate-800/90 border border-amber-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-amber-400 font-semibold">{currentStep.roadName} ({currentStep.speedLimitKmh} km/h)</div>
              <div className="text-xs font-bold text-white truncate">{currentStep.instruction}</div>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              {currentStep.distanceMeters}m
            </div>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {/* Safety PIN Verification Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center">
          <div className="text-xs text-amber-300 font-medium">Verify your driver with 4-Digit Security PIN:</div>
          <div className="mt-1 text-3xl font-black tracking-widest text-white font-mono">
            {trip.safetyOtp}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Do not enter vehicle until driver confirms this PIN matches their app.
          </div>
        </div>

        {/* Driver Details Card */}
        {driver ? (
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="flex items-center gap-3.5">
              <img
                src={driver.photoUrl}
                alt={driver.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white truncate">{driver.name}</h3>
                  <span className="p-0.5 rounded bg-amber-500 text-slate-950" title="PrDP Verified">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  {driver.vehicleModel} · <span className="font-mono text-amber-400 font-bold">{driver.vehiclePlate}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-amber-400 font-bold">★ {driver.rating} Driver</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-medium">★ {trip.riderRating || 4.98} Your Rating</span>
                  <span>·</span>
                  <span>{driver.totalTrips} trips</span>
                </div>
              </div>
            </div>

            {/* Mutual Rating Trust Badge */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold text-white">Mutual Ratings Active:</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-amber-400 font-bold">Driver: ★ {driver.rating}</span>
                <span className="text-slate-500">·</span>
                <span className="text-emerald-400 font-bold">You (Rider): ★ {trip.riderRating || 4.98}</span>
              </div>
            </div>

            {/* Quick Driver Contact Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/60">
              <a
                href={`tel:${driver.phone}`}
                className="py-2 px-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Driver</span>
              </a>
              <button
                onClick={() => alert(`Messaging ${driver.name}: Driver is 2 mins away in Newcastle.`)}
                className="py-2 px-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Message</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center animate-spin">
              <Navigation className="w-5 h-5" />
            </div>
            <p className="mt-3 text-xs text-slate-300">Matching nearest vetted driver in Newcastle CBD / Madadeni corridor...</p>
          </div>
        )}

        {/* Route Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
            <div className="flex-1 truncate">
              <span className="text-slate-400">From: </span>
              <span className="font-semibold text-slate-200">{trip.pickup.name}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-3 h-3 rounded-full bg-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 truncate">
              <span className="text-slate-400">To: </span>
              <span className="font-semibold text-slate-200">{trip.destination.name}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300 font-mono">
            <span>Estimated Fare: <strong className="text-amber-400 font-bold">R{trip.estimatedPriceZAR}</strong></span>
            <span>{trip.distanceKm} km · {trip.category.name}</span>
          </div>
        </div>

        {/* Safety Features Bar */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-400">Hamba Safety Suite</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Audio Recording */}
            <button
              onClick={() => setIsAudioRecording(!isAudioRecording)}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition ${
                isAudioRecording
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isAudioRecording ? (
                <>
                  <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Recording Audio</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4 text-slate-400" />
                  <span>Record Ride Audio</span>
                </>
              )}
            </button>

            {/* Share Trip */}
            <button
              onClick={handleShareTrip}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2 transition"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Share Trip Link</span>
            </button>
          </div>

          {showShareNotification && (
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-[11px] text-emerald-300 text-center">
              Tracking link copied to clipboard. Share with friends / family via SMS or WhatsApp!
            </div>
          )}

          {/* SOS Emergency Button */}
          <button
            onClick={onTriggerSOS}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>Emergency SOS (Namola / 10111 SAPS)</span>
          </button>
        </div>
      </div>

      {/* Action Footer: Drive Simulation & Cancel */}
      <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 sticky bottom-0 z-20 space-y-3">
        {trip.status !== 'completed' ? (
          <>
            <button
              onClick={onAdvanceSimulation}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              <FastForward className="w-4 h-4" />
              <span>
                {trip.status === 'requesting' && 'Simulate Driver Acceptance'}
                {trip.status === 'driver_assigned' && 'Simulate Driver Arrival'}
                {trip.status === 'driver_arriving' && 'Start Ride Navigation'}
                {trip.status === 'in_progress' && 'Advance Car Along Route'}
              </span>
            </button>

            <button
              onClick={onCancelTrip}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Cancel Ride Request
            </button>
          </>
        ) : (
          <div className="space-y-3">
            {/* Mutual Rating Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Rate Driver {driver?.name || 'Sipho'}</span>
                <span className="text-amber-400 font-mono font-bold">{ratingStars}.0 Stars</span>
              </div>

              {/* Star selector */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className="p-1 transition hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Quick feedback tags */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {['Safe & Smooth Driver', 'Clean Car', 'Punctual Arrival', 'Great Local Route'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Reciprocal feedback from Driver */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Driver's Rating for You:</span>
                <span className="text-emerald-400 font-semibold font-mono">★★★★★ 5.0 (Great Rider)</span>
              </div>
            </div>

            {/* Birthday Free Ride Note */}
            {(trip.discountType === 'birthday_free_2nd' || trip.discountType === 'birthday_free') && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-400/60 text-xs text-amber-200 text-center font-medium">
                🎂 Happy Birthday! This 2nd ride today is <strong>100% FREE (R0.00)</strong>, paid in full by Hamba App directly to driver {driver?.name || 'Sipho'}.
              </div>
            )}
            {trip.discountType === 'new_member_50' && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-xs text-emerald-300 text-center font-medium">
                🎉 50% New Member Welcome Discount Applied — Enjoy Hamba across South Africa!
              </div>
            )}

            <button
              onClick={onCompleteTrip}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Mutual Ratings & Finish ({trip.estimatedPriceZAR === 0 ? 'FREE R0' : `R${trip.estimatedPriceZAR}`})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
