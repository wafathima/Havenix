import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="30" height="30">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const PropertyMap = ({ property, nearbyPlaces = [] }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const defaultPosition = [28.6139, 77.2090];
  
  const getPropertyCoordinates = () => {
    if (property?.coordinates) {
      return [property.coordinates.lat, property.coordinates.lng];
    }
   
    return defaultPosition;
  };

  const propertyPosition = getPropertyCoordinates();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView(propertyPosition, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    L.marker(propertyPosition, {
      icon: createCustomIcon('#e63535')
    }).addTo(mapRef.current)
      .bindPopup(`
        <b>${property?.title || 'Property'}</b><br/>
        ${property?.location || ''}<br/>
        <span style="color: #0F766E; font-weight: bold;">${property?.price ? '₹ ' + property.price.toLocaleString('en-IN') : ''}</span>
      `);

    nearbyPlaces.forEach(place => {
      if (place.coordinates) {
        const placeColor = 
          place.type === 'hospital' ? '#EF4444' :
          place.type === 'school' ? '#10B981' :
          place.type === 'restaurant' ? '#F59E0B' :
          place.type === 'mall' ? '#8B5CF6' :
          place.type === 'transport' ? '#3B82F6' : '#6B7280';

        L.marker([place.coordinates.lat, place.coordinates.lng], {
          icon: createCustomIcon(placeColor)
        }).addTo(mapRef.current)
          .bindPopup(`
            <b>${place.name}</b><br/>
            <span style="color: #6B7280;">${place.type || 'Place'}</span><br/>
            <span style="color: #0F766E;">${place.distance || ''}</span>
          `);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [property, nearbyPlaces]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-[#1F2937]">Location</h3>
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property?.location || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#0F766E] hover:underline flex items-center gap-1"
        >
          <FaMapMarkerAlt />
          Open in Google Maps
        </a>
      </div>
      
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200"
      />

      {/* Map Attribution */}
      <p className="text-xs text-gray-400 text-center">
        Map data © <a href="https://www.openstreetmap.org/copyright" className="hover:underline" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
      </p>
    </div>
  );
};

export default PropertyMap;