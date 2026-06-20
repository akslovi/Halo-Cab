const logger = require('../utils/logger');

// In-memory surge pricing store (would use Redis in production)
let surgeConfig = {
  enabled: false,
  multiplier: 1.0,
  zones: {},
  peakHours: [
    { start: 8, end: 10, multiplier: 1.3 },  // Morning rush
    { start: 17, end: 20, multiplier: 1.5 },  // Evening rush
    { start: 22, end: 24, multiplier: 1.2 },  // Late night
  ],
};

class PricingService {
  /**
   * Calculate fare estimate based on distance, duration, and vehicle type
   */
  static calculateFare(distance, duration, vehicleType, couponDiscount = 0) {
    const baseFare = vehicleType === 'cab'
      ? parseFloat(process.env.BASE_FARE_CAB || 50)
      : parseFloat(process.env.BASE_FARE_BIKE || 20);

    const perKm = vehicleType === 'cab'
      ? parseFloat(process.env.PER_KM_CAB || 12)
      : parseFloat(process.env.PER_KM_BIKE || 7);

    const perMin = vehicleType === 'cab'
      ? parseFloat(process.env.PER_MIN_CAB || 2)
      : parseFloat(process.env.PER_MIN_BIKE || 1);

    const distanceFare = Math.round(distance * perKm);
    const timeFare = Math.round(duration * perMin);
    const surgeMultiplier = this.getSurgeMultiplier();
    const subtotal = baseFare + distanceFare + timeFare;
    const surgeFare = Math.round(subtotal * (surgeMultiplier - 1));
    const total = Math.round(subtotal + surgeFare - couponDiscount);

    return {
      baseFare,
      distanceFare,
      timeFare,
      surgeFare,
      surgeMultiplier,
      discount: couponDiscount,
      total: Math.max(total, baseFare), // Minimum fare is base fare
    };
  }

  /**
   * Get current surge multiplier based on time or manual override
   */
  static getSurgeMultiplier() {
    if (surgeConfig.enabled && surgeConfig.multiplier > 1) {
      return surgeConfig.multiplier;
    }

    // Time-based surge
    const hour = new Date().getHours();
    for (const peak of surgeConfig.peakHours) {
      if (hour >= peak.start && hour < peak.end) {
        return peak.multiplier;
      }
    }

    return 1.0;
  }

  /**
   * Set surge pricing (admin)
   */
  static setSurge(enabled, multiplier) {
    surgeConfig.enabled = enabled;
    surgeConfig.multiplier = multiplier;
    logger.info(`Surge pricing updated: enabled=${enabled}, multiplier=${multiplier}`);
    return surgeConfig;
  }

  /**
   * Get current surge config
   */
  static getSurgeConfig() {
    return {
      ...surgeConfig,
      currentMultiplier: this.getSurgeMultiplier(),
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this._toRad(lat2 - lat1);
    const dLng = this._toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) *
        Math.cos(this._toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Estimate duration based on distance (simple model)
   * Assumes average speed: cab = 25 km/h, bike = 30 km/h in city
   */
  static estimateDuration(distance, vehicleType) {
    const avgSpeed = vehicleType === 'cab' ? 25 : 30;
    const minutes = (distance / avgSpeed) * 60;
    return Math.max(Math.round(minutes), 5); // Minimum 5 minutes
  }

  static _toRad(deg) {
    return (deg * Math.PI) / 180;
  }
}

module.exports = PricingService;
