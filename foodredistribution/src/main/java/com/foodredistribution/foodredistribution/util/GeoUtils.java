package com.foodredistribution.foodredistribution.util;

/**
 * Haversine formula — calculates the great-circle distance between two
 * points on Earth given their latitude/longitude in decimal degrees.
 *
 * Accuracy: ~0.5% error, sufficient for proximity search up to ~500 km.
 * For higher precision use Vincenty's formula or a spatial DB extension.
 */
public final class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private GeoUtils() {}

    /**
     * Returns the distance in kilometres between two coordinates.
     */
    public static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Returns true if the point (lat2, lon2) is within radiusKm of (lat1, lon1).
     */
    public static boolean isWithinRadius(double lat1, double lon1,
                                         double lat2, double lon2,
                                         double radiusKm) {
        return distanceKm(lat1, lon1, lat2, lon2) <= radiusKm;
    }
}
