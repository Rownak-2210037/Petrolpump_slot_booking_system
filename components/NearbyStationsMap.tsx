'use client';

import { useEffect, useState } from 'react';
import { Station } from '@/types/station';

// 🎯 FIX: Move the dynamic wrapper here! This is a client component, 
// so Next.js allows `{ ssr: false }` perfectly here without crashing!
import dynamic from 'next/dynamic';
const DriverMap = dynamic(
  () => import('@/components/DriverMap'),
  { 
    ssr: false, 
    loading: () => <p className="text-sm text-gray-400 italic">Loading interactive map canvas...</p> 
  }
);

export default function NearbyStationsMap() {
// ... Leave all your remaining useState, useEffect, and HTML map rendering below exactly the same ...
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  // 🌐 Capture driver location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation failed:", error);
          // Fallback coordinate target if location is denied (Brahmanbaria default center)
          setUserCoords({ lat: 23.9602, lng: 91.1115 });
        }
      );
    } else {
      setUserCoords({ lat: 23.9602, lng: 91.1115 });
    }
  }, []);

  // 🔌 Fetch nearby stations from your updated API
  // 🔌 Fetch nearby stations from your updated API
  // 🔌 Fetch nearby stations from your updated API
  useEffect(() => {
    // 🎯 THE CRITICAL FIX: If userCoords is null, exit immediately! 
    // This stops lines 43 from executing when there is no location data yet.

    async function getNearbyPumps() {
      if (!userCoords) return; 
      try {
        const res = await fetch(
          `/api/admin/stations?lat=${userCoords.lat}&lng=${userCoords.lng}`,
          { method: 'GET', cache: 'no-store' }
        );
        
        const data = await res.json();
        setNearbyStations(data.stations || []);
      } catch (err) {
        console.error("Failed fetching proximal stations:", err);
      } finally {
        setLoadingMap(false);
      }
    }

    getNearbyPumps();
  }, [userCoords]); // 🔄 This triggers automatically the millisecond userCoords gets actual data!
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        ⛽ Petrol Pumps Within 10 KM Radius
      </h2>
      
      {loadingMap || !userCoords ? (
        <p className="text-sm text-gray-400 italic">Finding nearby stations...</p>
      ) : (
        <>
          {/* 🎯 Embed the proximity driver map container */}
          <DriverMap stations={nearbyStations} userCoords={userCoords} />
          
          {/* List the nearby stations underneath */}
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            {nearbyStations.map((station) => (
              <div key={station.id} className="p-3 border rounded-lg bg-gray-50 flex flex-col justify-center">
                <h4 className="font-semibold text-gray-700 text-sm">{station.name}</h4>
                <p className="text-xs text-gray-500">{station.address}</p>
              </div>
            ))}
            {nearbyStations.length === 0 && (
              <p className="text-xs text-gray-400 italic col-span-2 py-2 text-center text-gray-400">
                No petrol stations found within 10 KM of your current location.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}