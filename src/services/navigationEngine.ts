import { LocationPoint, NavigationStep, RideCategory } from '../types';

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

// Compute compass bearing from point A to point B in degrees
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

// Generate realistic polyline coordinates between pickup & destination
export function generateRouteCoordinates(
  start: [number, number],
  end: [number, number],
  stepsCount: number = 24
): [number, number][] {
  const coords: [number, number][] = [];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  // Midpoint with slight organic road curving offset
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  
  // Perpendicular curve vector to simulate road corridors
  const perpLat = -(lng2 - lng1) * 0.15;
  const perpLng = (lat2 - lat1) * 0.15;
  const waypoint: [number, number] = [midLat + perpLat, midLng + perpLng];

  // Quadratic Bezier interpolation for smooth road-following curve
  for (let i = 0; i <= stepsCount; i++) {
    const t = i / stepsCount;
    const invT = 1 - t;
    const lat = invT * invT * lat1 + 2 * invT * t * waypoint[0] + t * t * lat2;
    const lng = invT * invT * lng1 + 2 * invT * t * waypoint[1] + t * t * lng2;
    coords.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }

  return coords;
}

// Calculate South African Rand (ZAR) fare
export function calculateFare(
  distanceKm: number,
  estimatedDurationMin: number,
  category: RideCategory
): number {
  const distanceFare = distanceKm * category.perKmZAR;
  const timeFare = estimatedDurationMin * category.perMinuteZAR;
  const rawFare = category.baseFareZAR + distanceFare + timeFare;
  // Round to nearest integer or 50 cents (typical in SA e-hailing)
  return Math.max(category.baseFareZAR, Math.round(rawFare));
}

// Estimate duration in minutes based on distance and road types
export function estimateDurationMinutes(distanceKm: number, isRural: boolean = false): number {
  // Average urban speed: 38 km/h; Rural speed: 55 km/h
  const avgSpeedKmh = isRural ? 48 : 36;
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.ceil(hours * 60) + 2; // +2 mins for traffic lights/stops
  return Math.max(4, minutes);
}

// Generate offline turn-by-turn guidance steps
export function generateTurnByTurnSteps(
  pickup: LocationPoint,
  destination: LocationPoint,
  distanceKm: number
): NavigationStep[] {
  const isRural = pickup.type === 'rural' || destination.type === 'rural';
  const steps: NavigationStep[] = [];

  steps.push({
    instruction: `Depart towards ${pickup.suburbOrDistrict} main arterial`,
    distanceMeters: 450,
    turnDirection: 'straight',
    roadName: pickup.name.includes('Scott') ? 'Scott Street' : 'Main Access Way',
    speedLimitKmh: 60,
    surfaceType: 'paved',
  });

  if (distanceKm > 3) {
    steps.push({
      instruction: 'Turn right onto Allen Street (R34) / N11 Link Corridor',
      distanceMeters: 1800,
      turnDirection: 'right',
      roadName: 'Allen Street / R34',
      speedLimitKmh: 70,
      surfaceType: 'paved',
    });
  }

  if (distanceKm > 7) {
    steps.push({
      instruction: 'Keep left towards Madadeni / Osizweni Provincial Arterial',
      distanceMeters: 4200,
      turnDirection: 'slight_left',
      roadName: 'Madadeni Link Expressway',
      speedLimitKmh: 80,
      surfaceType: 'paved',
    });
  }

  if (isRural) {
    steps.push({
      instruction: 'Caution: Transition onto Normandien rural gravel route. Reduce speed.',
      distanceMeters: 3100,
      turnDirection: 'straight',
      roadName: 'District Rural Road D134 (Gravel)',
      speedLimitKmh: 50,
      surfaceType: 'gravel',
    });
  }

  steps.push({
    instruction: `Take the roundabout 2nd exit towards ${destination.name}`,
    distanceMeters: 650,
    turnDirection: 'roundabout',
    roadName: 'Approaching Destination',
    speedLimitKmh: 40,
    surfaceType: 'paved',
  });

  steps.push({
    instruction: `Arrive safely at ${destination.name}`,
    distanceMeters: 50,
    turnDirection: 'arrive',
    roadName: destination.name,
    speedLimitKmh: 20,
    surfaceType: 'paved',
  });

  return steps;
}
