import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationPoint, RoadHazardAlert, TripDetails } from '../types';
import { NEWCASTLE_HAZARDS } from '../data/provinces';
import { Compass, Layers, AlertTriangle, Crosshair } from 'lucide-react';

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  pickup: LocationPoint | null;
  destination: LocationPoint | null;
  routeCoords: [number, number][];
  driverPosition?: [number, number] | null;
  driverBearing?: number;
  activeTrip: TripDetails | null;
  isOffline: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  pickup,
  destination,
  routeCoords,
  driverPosition,
  driverBearing = 0,
  activeTrip,
  isOffline,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Markers and layers references
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeBackgroundLineRef = useRef<L.Polyline | null>(null);
  const hazardLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'outdoor'>('dark');
  const [showHazards, setShowHazards] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // OpenStreetMap standard tile layer (cached by Service Worker)
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    hazardLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle user clicking anywhere on map to adjust destination or inspect
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center & zoom when province changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom, { animate: true });
  }, [center, zoom]);

  // Update Pickup and Destination Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Pickup Marker
    if (pickup) {
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping"></div>
            <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <circle cx="12" cy="12" r="4"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<strong class="text-xs">Pickup:</strong><br>${pickup.name}`);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    // Destination Marker
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destination.lat, destination.lng]);
      } else {
        destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<strong class="text-xs">Destination:</strong><br>${destination.name}`);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
  }, [pickup, destination]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeCoords && routeCoords.length > 1) {
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(routeCoords);
      } else {
        // Background glow line
        routeBackgroundLineRef.current = L.polyline(routeCoords, {
          color: '#f59e0b',
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Core line
        routePolylineRef.current = L.polyline(routeCoords, {
          color: '#fbbf24',
          weight: 4,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      // Auto-fit bounds if we have both points and not in active mid-drive
      if (!activeTrip || activeTrip.status === 'requesting' || activeTrip.status === 'driver_assigned') {
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
    } else {
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      if (routeBackgroundLineRef.current) {
        routeBackgroundLineRef.current.remove();
        routeBackgroundLineRef.current = null;
      }
    }
  }, [routeCoords, activeTrip?.status]);

  // Update Driver Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (driverPosition) {
      const carIcon = L.divIcon({
        className: 'custom-driver-car-marker',
        html: `
          <div style="transform: rotate(${driverBearing}deg); transition: transform 0.4s ease-out;" class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
                <circle cx="7.5" cy="14.5" r="1.5" fill="#f59e0b"/>
                <circle cx="16.5" cy="14.5" r="1.5" fill="#f59e0b"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(driverPosition);
        driverMarkerRef.current.setIcon(carIcon);
      } else {
        driverMarkerRef.current = L.marker(driverPosition, { icon: carIcon })
          .addTo(map)
          .bindPopup(`<strong class="text-xs">Hamba Driver</strong><br>En route with live GPS`);
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
      driverMarkerRef.current = null;
    }
  }, [driverPosition, driverBearing]);

  // Update Road Hazards
  useEffect(() => {
    const group = hazardLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (showHazards) {
      NEWCASTLE_HAZARDS.forEach((h: RoadHazardAlert) => {
        let badgeColor = 'bg-amber-500';
        let iconLabel = '!';
        if (h.type === 'livestock') {
          badgeColor = 'bg-emerald-600';
          iconLabel = '🐮';
        } else if (h.type === 'robot_outage') {
          badgeColor = 'bg-rose-600';
          iconLabel = '⚡';
        } else if (h.type === 'unpaved_gravel') {
          badgeColor = 'bg-orange-600';
          iconLabel = '▲';
        }

        const hazardIcon = L.divIcon({
          className: 'hazard-marker',
          html: `
            <div class="flex items-center justify-center w-7 h-7 rounded-full ${badgeColor} text-white font-bold text-xs shadow-md border border-white/60">
              ${iconLabel}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([h.lat, h.lng], { icon: hazardIcon })
          .addTo(group)
          .bindPopup(`
            <div class="text-xs text-slate-900">
              <strong class="font-bold">${h.title}</strong>
              <p class="mt-1">${h.description}</p>
            </div>
          `);
      });
    }
  }, [showHazards]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (driverPosition) {
      mapInstanceRef.current.setView(driverPosition, 15, { animate: true });
    } else if (pickup && destination) {
      mapInstanceRef.current.fitBounds([
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng],
      ], { padding: [50, 50], animate: true });
    } else {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] overflow-hidden ${mapTheme === 'dark' ? 'dark-tiles' : 'outdoor-tiles'}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Offline Mode Banner Overlay */}
      {isOffline && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/90 text-slate-950 font-medium text-xs backdrop-blur-md shadow-md border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
          <span>Remote Offline Navigation Active (Using Local Vector Pack)</span>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {/* Recenter */}
        <button
          onClick={handleRecenter}
          title="Recenter on current view"
          className="w-10 h-10 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/80 shadow-lg flex items-center justify-center hover:bg-slate-800 hover:text-white transition active:scale-95"
        >
          <Crosshair className="w-5 h-5 text-amber-400" />
        </button>

        {/* Night / Outdoor Contrast Toggle */}
        <button
          onClick={() => setMapTheme(mapTheme === 'dark' ? 'outdoor' : 'dark')}
          title={mapTheme === 'dark' ? 'Switch to Outdoor Sunlight Map' : 'Switch to Dark Night Map'}
          className="w-10 h-10 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/80 shadow-lg flex items-center justify-center hover:bg-slate-800 hover:text-white transition active:scale-95"
        >
          <Layers className="w-5 h-5 text-slate-200" />
        </button>

        {/* Hazard overlay toggle */}
        <button
          onClick={() => setShowHazards(!showHazards)}
          title="Toggle Road Hazard Warnings (Potholes, Livestock, Load Shedding)"
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition active:scale-95 border ${
            showHazards
              ? 'bg-amber-500 text-slate-950 border-amber-300'
              : 'bg-slate-900/90 text-slate-400 border-slate-700/80 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
      </div>

      {/* Map Scale & Local Province Watermark (Unobtrusive) */}
      <div className="absolute bottom-3 right-3 z-[1000] pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 text-[11px] text-slate-400 font-mono">
        <Compass className="w-3.5 h-3.5 text-amber-500" />
        <span>Newcastle & Amajuba · 29.93°E / 27.75°S</span>
      </div>
    </div>
  );
};
