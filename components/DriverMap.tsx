'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Station } from '@/types/station';

// 🎯 CRITICAL FIX: Leaflet default markers often break in Next.js because of path building.
// This block configures custom CDN assets for beautiful default pins.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface DriverMapProps {
  stations: Station[];
  userCoords: { lat: number; lng: number };
}

export default function DriverMap({ stations, userCoords }: DriverMapProps) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-sm border bg-gray-50 relative z-0">
      <MapContainer 
        center={[userCoords.lat, userCoords.lng]} 
        zoom={12} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* 🗺️ Free OpenStreetMap Graphic Vectors Tile Layer (Completely Keyless!) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔵 Driver Pinpoint Marker */}
        <Marker position={[userCoords.lat, userCoords.lng]} icon={defaultIcon}>
          <Popup>
            <div className="text-center">
              <span className="font-bold text-blue-600 text-xs">Your Current Location</span>
            </div>
          </Popup>
        </Marker>

        {/* 🔴 Nearby Petrol Pumps Loop */}
        {stations.map((station) => {
          // Safety guard: skip rendering if station coordinates are corrupted or missing
          if (!station.latitude || !station.longitude) return null;
          
          return (
            <Marker 
              key={station.id} 
              position={[station.latitude, station.longitude]} 
              icon={defaultIcon}
            >
              <Popup>
                <div className="p-1 min-w-[160px] text-xs space-y-2">
                  <div className="space-y-0.5">
                    <strong className="text-gray-800 font-bold block text-sm leading-tight">
                      {station.name}
                    </strong>
                    <p className="text-gray-500 m-0 leading-snug">{station.address}</p>
                    <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded mt-1">
                      Capacity: {station.capacity} Liters
                    </span>
                  </div>

                  {/* ⚡ ACTION LINK: Clicking this redirects the driver to the booking form */}
                  <a
                    href={`/stations/${station.id}`}
                    className="block w-full text-center px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg no-underline transition-colors shadow-sm"
                  >
                    Select & Book Slot ➔
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}