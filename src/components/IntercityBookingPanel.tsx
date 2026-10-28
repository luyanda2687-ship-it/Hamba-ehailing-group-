import React, { useState } from 'react';
import { IntercityCorridor, POPULAR_INTERCITY_CORRIDORS, RIDE_CATEGORIES } from '../data/provinces';
import { PaymentMethod, RideCategory } from '../types';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Coffee, 
  ArrowRight, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Navigation,
  Compass,
  Zap,
  Check
} from 'lucide-react';

interface IntercityBookingPanelProps {
  onBookIntercity: (
    corridor: IntercityCorridor,
    tripType: 'shared' | 'private',
    seats: number,
    travelDate: string,
    travelTime: string,
    fareZAR: number
  ) => void;
  isOffline: boolean;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
}

export const IntercityBookingPanel: React.FC<IntercityBookingPanelProps> = ({
  onBookIntercity,
  isOffline,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<IntercityCorridor>(POPULAR_INTERCITY_CORRIDORS[0]);
  const [tripType, setTripType] = useState<'shared' | 'private'>('shared');
  const [seats, setSeats] = useState(1);
  const [travelDate, setTravelDate] = useState('Today (Express)');
  const [travelTime, setTravelTime] = useState('14:30');

  const unitFare = tripType === 'shared' ? selectedCorridor.sharedFareZAR : selectedCorridor.privateFareZAR;
  const totalFareZAR = tripType === 'shared' ? unitFare * seats : unitFare;

  const handleBook = () => {
    onBookIntercity(selectedCorridor, tripType, seats, travelDate, travelTime, totalFareZAR);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bus className="w-4 h-4 text-amber-400" />
              <span>Intercity & Long-Distance Express</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Direct highway travel connecting Newcastle with major metros & all 9 provinces
            </p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
            Tolls Included
          </span>
        </div>

        {/* Shared vs Private Shuttle Selector */}
        <div className="mt-3 grid grid-cols-2 gap-1 bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTripType('shared')}
            className={`py-2 rounded-lg transition ${
              tripType === 'shared' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Shared Shuttle (Per Seat)
          </button>
          <button
            onClick={() => setTripType('private')}
            className={`py-2 rounded-lg transition ${
              tripType === 'private' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Private Long-Distance Car
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {/* Popular Intercity Corridors */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">Select Long Distance Route</label>
          <div className="space-y-2">
            {POPULAR_INTERCITY_CORRIDORS.map((corridor) => {
              const isSelected = selectedCorridor.id === corridor.id;
              const displayPrice = tripType === 'shared' ? corridor.sharedFareZAR : corridor.privateFareZAR;

              return (
                <div
                  key={corridor.id}
                  onClick={() => setSelectedCorridor(corridor)}
                  className={`p-3.5 rounded-2xl cursor-pointer border transition ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{corridor.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{corridor.highway}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-amber-400 font-mono">
                        R{displayPrice}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {tripType === 'shared' ? 'per seat' : 'full vehicle'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          Est. Duration: {corridor.estHours} hrs ({corridor.distanceKm} km)
                        </span>
                        <span className="text-emerald-400 font-medium">Tolls (R{corridor.tollCostZAR}) Covered</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Coffee className="w-3.5 h-3.5 text-amber-400" />
                        <span>Rest Stops: {corridor.restStops.join(' · ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Departure Schedule & Seats */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Departure Date</label>
              <select
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="Today (Express)">Today (Express)</option>
                <option value="Tomorrow Morning">Tomorrow Morning</option>
                <option value="Friday Weekend Run">Friday Weekend Run</option>
                <option value="Sunday Return">Sunday Return</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Departure Time</label>
              <select
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="06:30">06:30 (Dawn Express)</option>
                <option value="09:00">09:00 (Mid-Morning)</option>
                <option value="14:30">14:30 (Afternoon)</option>
                <option value="17:30">17:30 (Evening)</option>
              </select>
            </div>
          </div>

          {tripType === 'shared' && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300">Number of Passengers</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold flex items-center justify-center text-white"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm text-amber-400">{seats}</span>
                <button
                  type="button"
                  onClick={() => setSeats(Math.min(6, seats + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold flex items-center justify-center text-white"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Safety & Luggage Guarantee */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>South African Long-Distance Safety Guarantee</span>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-1">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Passenger Liability Insurance on all national highways</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Mandatory rest stops every 2.5 hours to prevent driver fatigue</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Luggage safely stowed in rear cargo bay with zero visibility blockage</span>
            </li>
          </ul>
        </div>

        {/* Payment selector */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Payment Method</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onPaymentMethodChange('ozow')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                paymentMethod === 'ozow' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Ozow / Instant EFT</span>
            </button>

            <button
              type="button"
              onClick={() => onPaymentMethodChange('card')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                paymentMethod === 'card' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4 text-sky-400" />
              <span>Bank Card (Capitec/FNB)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Action Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 sticky bottom-0 z-20">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400">Total Intercity Fare ({tripType === 'shared' ? `${seats} seat(s)` : 'Private Car'})</span>
          <span className="text-xl font-black text-white font-mono">R{totalFareZAR}</span>
        </div>

        <button
          onClick={handleBook}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <span>Confirm Intercity {tripType === 'shared' ? 'Shuttle' : 'Private'} Booking</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
