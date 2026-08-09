import { useEffect, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function formatCoordinateFallback(latitude, longitude) {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

function GpsResolver({ enabled, onLocation, onError }) {
  const geocodingLibrary = useMapsLibrary('geocoding');
  const [coordinates, setCoordinates] = useState(null);
  const onLocationRef = useRef(onLocation);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLocationRef.current = onLocation;
  }, [onLocation]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!enabled) return undefined;

    if (!navigator.geolocation) {
      onErrorRef.current?.(new Error('Geolocation is not supported by this browser.'));
      return undefined;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const nextCoordinates = { latitude, longitude };

        setCoordinates(nextCoordinates);

        // GPS itself is enough to unblock the form. A readable address will
        // replace this fallback once Google reverse-geocoding succeeds.
        onLocationRef.current?.({
          ...nextCoordinates,
          locationText: formatCoordinateFallback(latitude, longitude),
          reverseGeocoded: false,
        });
      },
      (error) => {
        if (!cancelled) {
          onErrorRef.current?.(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !coordinates || !geocodingLibrary) return undefined;

    let cancelled = false;
    const geocoder = new geocodingLibrary.Geocoder();

    geocoder
      .geocode({
        location: {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        },
      })
      .then((response) => {
        if (cancelled) return;

        const formattedAddress = response.results?.[0]?.formatted_address?.trim();
        if (!formattedAddress) return;

        onLocationRef.current?.({
          ...coordinates,
          locationText: formattedAddress,
          reverseGeocoded: true,
        });
      })
      .catch((error) => {
        // Keep the coordinate fallback rather than blocking submission just
        // because reverse-geocoding is temporarily unavailable.
        console.warn('[Location] Reverse geocoding failed; keeping GPS coordinates.', error);
      });

    return () => {
      cancelled = true;
    };
  }, [coordinates, enabled, geocodingLibrary]);

  return null;
}

export default function GpsLocationAutofill({ enabled = true, onLocation, onError }) {
  if (!enabled) return null;

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY || ''}
      onError={(error) => {
        console.warn('[Location] Google Maps API could not load for reverse geocoding.', error);
      }}
    >
      <GpsResolver enabled={enabled} onLocation={onLocation} onError={onError} />
    </APIProvider>
  );
}
