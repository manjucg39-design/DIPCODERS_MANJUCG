// Real Mysuru localities with genuine coordinates for Haversine distance calculations
export const MYSURU_LOCALITIES: Record<string, { lat: number; lng: number }> = {
  'Gokulam': { lat: 12.3300, lng: 76.6200 },
  'Vijayanagar': { lat: 12.3350, lng: 76.6020 },
  'Kuvempunagar': { lat: 12.2850, lng: 76.6250 },
  'Saraswathipuram': { lat: 12.3020, lng: 76.6320 },
  'Jayalakshmipuram': { lat: 12.3180, lng: 76.6280 },
  'Hebbal': { lat: 12.3600, lng: 76.6100 },
  'Chamundipuram': { lat: 12.2900, lng: 76.6550 },
  'Vontikoppal': { lat: 12.3250, lng: 76.6350 },
  'Bannimantap': { lat: 12.3400, lng: 76.6500 },
  'Nazarbad': { lat: 12.3100, lng: 76.6650 },
  'Dattagalli': { lat: 12.2700, lng: 76.6100 },
};

// Real Haversine spherical distance formula
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
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
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}
