import React, { useState } from 'react';
import { DriverProfile, LocationPoint, NavigationStep, TripDetails } from '../types';
import { SAMPLE_DRIVERS, NEWCASTLE_LOCATIONS } from '../data/provinces';
import { 
  Navigation, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Fuel, 
  WifiOff, 
  CheckCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

interface DriverDashboardProps {
  currentDriver: DriverProfile;
  isDriverOnline: boolean;
  onToggleDriverOnline: () => void;
  activeTrip: TripDetails | null;
  currentStep: NavigationStep | null;
  onAcceptIncomingRequest?: () => void;
  onAdvanceDriveStep?: () => void;
  onCompleteDriverTrip?: () => void;
  isOffline: boolean;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentDriver,
  isDriverOnline,
  onToggleDriverOnline,
  activeTrip,
  currentStep,
  onAcceptIncomingRequest,
  onAdvanceDriveStep,
  onCompleteDriverTrip,
  isOffline,
}) => {
  const [selectedTab, setSelectedTab] = useState<'hud' | 'earnings' | 'fuel_radar'>('hud');

  // Newcastle 24/7 Fuel Stations with Load-Shedding Generators
  const newcastleFuelStations = [
    { name: 'Shell Oasis Allen St', address: 'Allen St & Victoria Rd', generatorActive: true, fuelAvailable: 'Petrol & Diesel 50ppm', distance: '1.2 km' },
    { name: 'TotalEnergies Scott St', address: 'Scott St CBD', generatorActive: true, fuelAvailable: 'Petrol & Diesel', distance: '2.1 km' },
    { name: 'Engen Madadeni 1-Stop', address: 'Madadeni Main Link Rd', generatorActive: true, fuelAvailable: 'Petrol & Diesel', distance: '4.8 km' },
    { name: 'BP Pioneer Park', address: 'Pioneer Park / R34', generatorActive: false, fuelAvailable: 'Limited stock', distance: '3.0 km' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Top Driver Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentDriver.photoUrl}
              alt={currentDriver.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-cover border border-amber-500"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{currentDriver.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                  PrDP Active
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {currentDriver.vehicleModel} · <span className="font-mono text-amber-400">{currentDriver.vehiclePlate}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-amber-400 font-bold">★ {currentDriver.rating} Driver Rating</span>
                <span>·</span>
                <span>{currentDriver.totalTrips} completed trips</span>
              </div>
            </div>
          </div>

          {/* Go Online / Offline Toggle Button */}
          <button
            onClick={onToggleDriverOnline}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              isDriverOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDriverOnline ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
            <span>{isDriverOnline ? 'Online (Amajuba)' : 'Go Online'}</span>
          </button>
        </div>

        {/* Driver Tabs */}
        <div className="mt-3 grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSelectedTab('hud')}
            className={`py-1.5 rounded-lg font-medium transition ${
              selectedTab === 'hud' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Navigation HUD
          </button>
          <button
            onClick={() => setSelectedTab('earnings')}
            className={`py-1.5 rounded-lg font-medium transition ${
              selectedTab === 'earnings' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Earnings (ZAR)
          </button>
          <button
            onClick={() => setSelectedTab('fuel_radar')}
            className={`py-1.5 rounded-lg font-medium transition ${
              selectedTab === 'fuel_radar' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fuel & Power
          </button>
        </div>

        {/* New Driver 50% Discount Reward Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-amber-950/80 border border-emerald-500/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <span className="font-bold text-white block">New Driver Joining Reward Active</span>
              <span className="text-[11px] text-emerald-300">50% Discount on Platform Commission (You keep 90%!) + R500 Bonus</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold font-mono shrink-0">
            50% OFF FEE
          </span>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {selectedTab === 'hud' && (
          <>
            {/* If there's an active trip */}
            {activeTrip ? (
              <div className="space-y-4">
                {/* Driver Navigation Heads-Up Display */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                          {activeTrip.status === 'in_progress' ? 'Drive to Destination' : 'Drive to Rider Pickup'}
                        </div>
                        <div className="text-sm font-bold text-white">
                          {currentStep?.instruction || 'Proceed along designated route'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Speedometer and road conditions */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">SPEED</div>
                      <div className="text-xl font-bold text-emerald-400">58 <span className="text-[10px] font-normal">km/h</span></div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">LIMIT</div>
                      <div className="text-xl font-bold text-white">{currentStep?.speedLimitKmh || 60} <span className="text-[10px] font-normal">km/h</span></div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">SURFACE</div>
                      <div className={`text-xs font-bold mt-1 ${currentStep?.surfaceType === 'gravel' ? 'text-orange-400' : 'text-slate-300'}`}>
                        {currentStep?.surfaceType === 'gravel' ? 'Gravel Pass' : 'Asphalt Paved'}
                      </div>
                    </div>
                  </div>

                  {/* Remote Area Notice */}
                  {isOffline && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
                      <WifiOff className="w-4 h-4 shrink-0" />
                      <span>Operating without cellular network. Route stored on Newcastle offline pack.</span>
                    </div>
                  )}
                </div>

                {/* Rider Info Card */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Passenger (Mutual Rating Visible)</span>
                    <span className="font-mono text-emerald-400 font-bold">Fare: R{activeTrip.estimatedPriceZAR}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Luyanda Khumalo</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                          ★ 4.98 Rider Rating
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{activeTrip.paymentMethod.toUpperCase()} · Newcastle Local (42 trips)</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400">PIN</div>
                      <div className="text-sm font-bold font-mono text-amber-400">{activeTrip.safetyOtp}</div>
                    </div>
                  </div>
                </div>

                {/* Driver Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={onAdvanceDriveStep}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Advance Route Simulation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onCompleteDriverTrip}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Ride & Collect R{activeTrip.estimatedPriceZAR}</span>
                  </button>
                </div>
              </div>
            ) : isDriverOnline ? (
              /* Waiting for ride requests */
              <div className="space-y-4">
                {/* New Driver 50% Incentive & Zero Commission Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span>🎉 New Driver Partner Reward</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                      0% Commission Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    New drivers keep <strong>100% of all ride fares</strong> (0% platform commission) for the first 30 days in Newcastle, plus an extra <strong>R500 sign-on bonus</strong> after completing your first 10 trips!
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Positioned in Newcastle Central</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    You are visible to riders in Newcastle CBD, Madadeni, Osizweni and Pioneer Park.
                  </p>
                </div>

                {/* Simulated Incoming Trip Request with Mutual Rider Rating */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Incoming Ride Request</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                        ★ 4.98 Rider Rating
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded">15s</span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white">Madadeni Plaza ➔ Newcastle Mall</div>
                    <div className="text-xs text-slate-300 mt-1">Passenger: Luyanda Khumalo (★ 4.98 · 42 trips) · Distance: 8.4 km</div>
                    
                    {/* Mutual Rating Transparency */}
                    <div className="mt-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] flex items-center justify-between">
                      <span className="text-slate-400">Mutual Ratings:</span>
                      <span className="text-amber-300 font-mono">
                        Rider ★ 4.98 (Visible to you) · You ★ {currentDriver.rating} (Visible to rider)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                    <div>
                      <div className="text-[10px] text-slate-400">ESTIMATED PAYOUT (50% APP FEE DISCOUNT)</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono">R82.00 (You keep 90%)</div>
                    </div>

                    <button
                      onClick={onAcceptIncomingRequest}
                      className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition cursor-pointer"
                    >
                      Accept Trip
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Driver Offline */
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">You are currently offline</h4>
                <p className="text-xs text-slate-400">
                  Tap 'Go Online' above to start receiving ride requests in Newcastle and Amajuba district.
                </p>
                <button
                  onClick={onToggleDriverOnline}
                  className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Start Shift
                </button>
              </div>
            )}
          </>
        )}

        {selectedTab === 'earnings' && (
          <div className="space-y-4">
            {/* Total Today */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Today's Earnings (ZAR)</div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">R 680.00</div>
              <div className="text-xs text-slate-500 flex items-center gap-2 pt-2">
                <span>8 Trips Completed</span>
                <span>·</span>
                <span>4.8 hrs online</span>
              </div>
            </div>

            {/* Cash vs In-App Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-slate-400">Cash Collected</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">R 420.00</div>
                <div className="text-[10px] text-slate-500">In pocket</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-slate-400">In-App / Ozow</div>
                <div className="text-base font-bold text-sky-400 font-mono mt-1">R 260.00</div>
                <div className="text-[10px] text-slate-500">Weekly bank payout</div>
              </div>
            </div>

            {/* Offline trip queue status */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Offline Trips Queue</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  All synced
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Trips recorded during network drops in outer Newcastle rural corridors automatically sync to Hamba servers when 4G resumes.
              </p>
            </div>
          </div>
        )}

        {selectedTab === 'fuel_radar' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Newcastle Fuel & Generator Radar</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                Load-Shedding Active
              </span>
            </div>

            <div className="space-y-2">
              {newcastleFuelStations.map((st, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{st.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{st.distance}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{st.address}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[11px]">
                    <span className="text-slate-300">{st.fuelAvailable}</span>
                    <span className={`font-semibold ${st.generatorActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {st.generatorActive ? 'Generator Running' : 'No Generator'}
                    </span>
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
