import React from 'react';
import { AppServiceMode, ProvinceId } from '../types';
import { SA_PROVINCES } from '../data/provinces';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  ShieldAlert, 
  WifiOff, 
  MapPin, 
  ChevronDown,
  Navigation,
  Bus,
  Package,
  Car,
  Map,
  Award
} from 'lucide-react';

interface HeaderProps {
  currentMode: AppServiceMode;
  onModeChange: (mode: AppServiceMode) => void;
  selectedProvince: ProvinceId;
  onProvinceChange: (p: ProvinceId) => void;
  onOpenSafetyHub: () => void;
  isOffline: boolean;
  loyaltyPoints?: number;
  scheduledCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  selectedProvince,
  onProvinceChange,
  onOpenSafetyHub,
  isOffline,
  loyaltyPoints,
  scheduledCount,
}) => {
  return (
    <header className="h-16 px-4 sm:px-6 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-30 select-none">
      {/* Zone 1: Single Wordmark Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onModeChange('ride');
          }}
          className="flex items-center gap-2 group cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
            <Navigation className="w-4 h-4 fill-slate-950 stroke-slate-950" />
          </div>
          <span className="text-xl font-black tracking-tight text-white font-sans">
            Hamba<span className="text-amber-400">.</span>
          </span>
        </a>

        {/* Province / Newcastle Quick Switcher */}
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => onProvinceChange(e.target.value as ProvinceId)}
            className="text-xs font-semibold bg-slate-900 border border-slate-700/80 text-amber-300 rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="kzn">Newcastle (Amajuba / KZN)</option>
            <option value="gauteng">Gauteng (JHB / Sandton / Pretoria)</option>
            <option value="western_cape">Western Cape (Cape Town)</option>
            <option value="eastern_cape">Eastern Cape (Gqeberha / Mthatha)</option>
            <option value="free_state">Free State (Bloemfontein)</option>
            <option value="limpopo">Limpopo (Polokwane)</option>
            <option value="mpumalanga">Mpumalanga (Mbombela)</option>
            <option value="north_west">North West (Rustenburg)</option>
            <option value="northern_cape">Northern Cape (Kimberley)</option>
          </select>
        </div>
      </div>

      {/* Zone 2: 4-5 Clean single-line nav controls */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onModeChange('ride')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'ride' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Local Ride</span>
          {scheduledCount !== undefined && scheduledCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              currentMode === 'ride' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {scheduledCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onModeChange('intercity')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            currentMode === 'intercity' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          <span>Intercity & Long Distance</span>
        </button>

        <button
          onClick={() => onModeChange('delivery')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            currentMode === 'delivery' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Safe Delivery & Food</span>
        </button>

        <button
          onClick={() => onModeChange('offline_maps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            currentMode === 'offline_maps' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Offline Maps</span>
        </button>

        <button
          onClick={() => onModeChange('rewards')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            currentMode === 'rewards' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Hamba Rewards</span>
          {loyaltyPoints !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              currentMode === 'rewards' ? 'bg-slate-950 text-amber-400' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {loyaltyPoints} pts
            </span>
          )}
        </button>

        <button
          onClick={() => onModeChange('driver')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            currentMode === 'driver' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>Driver Partner</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions (Safety SOS, PWA Install, Profile quick button) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Offline indicator badge */}
        {isOffline && (
          <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/70 border border-amber-800/80 px-2 py-1 rounded-lg">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Remote Offline</span>
          </span>
        )}

        {/* Profile / Rewards quick link */}
        <button
          onClick={() => onModeChange('rewards')}
          title="Open Hamba Rewards & Profile"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition active:scale-95 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
            LK
          </div>
          <span className="hidden sm:inline font-mono font-bold text-amber-400">
            {loyaltyPoints || 840} pts
          </span>
        </button>

        {/* In-App PWA Install Button */}
        <PWAInstallButton />

        {/* 10111 / Namola SOS Emergency Trigger */}
        <button
          onClick={onOpenSafetyHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/80 text-rose-300 hover:text-rose-200 text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          title="Emergency Armed Response & SAPS 10111"
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span className="hidden xs:inline">SOS</span>
        </button>
      </div>
    </header>
  );
};
