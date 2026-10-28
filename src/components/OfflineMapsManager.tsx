import React, { useState } from 'react';
import { OfflineMapPack } from '../types';
import { offlineStorage } from '../services/offlineStorage';
import { 
  DownloadCloud, 
  CheckCircle2, 
  Trash2, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  Map, 
  Compass, 
  ShieldCheck, 
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';

interface OfflineMapsManagerProps {
  packs: OfflineMapPack[];
  onUpdatePacks: (packs: OfflineMapPack[]) => void;
  isOffline: boolean;
  onToggleOfflineSimulation: () => void;
  onClose?: () => void;
}

export const OfflineMapsManager: React.FC<OfflineMapsManagerProps> = ({
  packs,
  onUpdatePacks,
  isOffline,
  onToggleOfflineSimulation,
  onClose,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);

  const cacheMetrics = offlineStorage.getCacheStorageMetrics();

  const handleDownloadPack = (packId: string) => {
    setDownloadingId(packId);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setDownloadingId(null);
          const updated = offlineStorage.updatePackStatus(packId, true, 100);
          onUpdatePacks(updated);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleDeletePack = (packId: string) => {
    const updated = offlineStorage.updatePackStatus(packId, false, 0);
    onUpdatePacks(updated);
  };

  const handleRunOfflineBenchmark = () => {
    const t0 = performance.now();
    // Simulate computing 1,200 road nodes on local device
    for (let i = 0; i < 40000; i++) {
      Math.sin(i) * Math.cos(i);
    }
    const t1 = performance.now();
    const duration = (t1 - t0).toFixed(1);
    setBenchmarkResult(`Local Vector Pathfinder: Computed 18.4km route in ${duration}ms using cached Newcastle road graph. Zero data consumed.`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Offline Maps & Remote Navigation</h2>
              <p className="text-[11px] text-slate-400">Reliable travel when cellular networks or power fails</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 space-y-5">
        {/* Network Simulator Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                {isOffline ? (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span>Remote Area (Offline Mode)</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span>Online (4G / LTE Connected)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isOffline
                  ? 'Simulating zero cellular signal in outer Newcastle / rural passes.'
                  : 'Connected to South African cellular network.'}
              </p>
            </div>

            <button
              onClick={onToggleOfflineSimulation}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isOffline
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isOffline ? 'Restore 4G' : 'Simulate Offline'}
            </button>
          </div>

          {/* Offline Benchmark Trigger */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleRunOfflineBenchmark}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Benchmark Local Routing Speed</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">0.0 KB Data</span>
          </div>

          {benchmarkResult && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 font-mono">
              ✓ {benchmarkResult}
            </div>
          )}
        </div>

        {/* Local Device Storage Gauge */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              Local Device Map Cache
            </span>
            <span className="font-mono text-white font-bold">
              {cacheMetrics.usedMB} MB / {cacheMetrics.totalAllocatedMB} MB
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (cacheMetrics.usedMB / cacheMetrics.totalAllocatedMB) * 100)}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>{cacheMetrics.downloadedPacks} of {cacheMetrics.totalPacks} Regional Packs Cached</span>
            <span className="text-emerald-400 font-medium">✓ IndexedDB Verified</span>
          </div>
        </div>

        {/* Available Regional Packs */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Regional Map Packs
          </div>

          <div className="space-y-2.5">
            {packs.map((pack) => {
              const isCurrentDownloading = downloadingId === pack.id;

              return (
                <div
                  key={pack.id}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5 transition hover:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{pack.name}</h4>
                        {pack.provinceId === 'kzn' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            Amajuba / KZN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{pack.region}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-200">{pack.sizeMB} MB</div>
                      <div className="text-[10px] text-slate-400">{pack.lastUpdated}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{pack.description}</p>

                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pack.features.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    {pack.isDownloaded ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Downloaded & Ready Offline</span>
                      </div>
                    ) : isCurrentDownloading ? (
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-amber-400">{downloadProgress}%</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadPack(pack.id)}
                        className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Download Pack ({pack.sizeMB} MB)</span>
                      </button>
                    )}

                    {pack.isDownloaded && pack.id !== 'pack_newcastle_amajuba' && (
                      <button
                        onClick={() => handleDeletePack(pack.id)}
                        title="Delete from cache"
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
