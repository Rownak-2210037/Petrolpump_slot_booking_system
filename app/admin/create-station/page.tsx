'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // import router
import Navbar from '@/components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateStation() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [message, setMessage] = useState('');
  const [isMapping, setIsMapping] = useState(false); // 🎯 Track loading state during coordinate fetch
  const router = useRouter(); // initialize router

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    
    if (!address.trim()) {
      toast.error('Please enter a valid text address, brother!');
      return;
    }

    setIsMapping(true);
    toast.loading('Fetching location coordinates...', { id: 'geo-toast' });

    try {
      // 1. 🎯 AUTOMATIC GEOCODING: Convert text address into Lat/Lng numbers using Nominatim API
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=bd&limit=1`;
      
      const geoResponse = await fetch(geocodeUrl, {
        headers: { 'User-Agent': 'FuelEase-App-Academic-Project' } // Required header policy
      });
      const geoData = await geoResponse.json();

      // Check if location could actually be identified within Bangladesh boundaries
      if (!geoData || geoData.length === 0) {
        toast.dismiss('geo-toast');
        setMessage('Could not map this location text. Try adding a city name (e.g., Sadar, Comilla)');
        toast.error('Invalid address location in Bangladesh!');
        setIsMapping(false);
        return;
      }

      // 2. Extract the hidden numerical vector coordinates
      const autoLatitude = parseFloat(geoData[0].lat);
      const autoLongitude = parseFloat(geoData[0].lon);

      // Update loading notification to database transaction phase
      toast.loading('Saving station data to Neon Cloud...', { id: 'geo-toast' });

      // 3. Send EVERYTHING (including the automated coordinates) to your database backend route
      const res = await fetch('/api/admin/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          address, 
          capacity,
          latitude: autoLatitude,   // 💾 Attached automatically behind the scenes!
          longitude: autoLongitude  // 💾 Attached automatically behind the scenes!
        }),
      });

      const data = await res.json();
      toast.dismiss('geo-toast');

      if (!res.ok) {
        setMessage(data.error || 'Failed');
        toast.error(data.error || 'Failed to create station');
      } else {
        toast.success(`"${name}" successfully mapped and created!`);
        setName('');
        setAddress('');
        setCapacity(1);

        // Navigate to the dashboard after a tiny delay so they see the success toast
        setTimeout(() => {
          router.push(`/admin/dashboard`);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      toast.dismiss('geo-toast');
      setMessage('Network error');
      toast.error('Network error occurred during mapping conversion');
    } finally {
      setIsMapping(false);
    }
  }

  return (
    <div>
      <Navbar />
      <Toaster position='top-right' />

      <main className='flex justify-center items-center min-h-screen bg-gray-100 px-4'>
        <div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-lg'>
          <h1 className='text-3xl font-bold mb-6 text-center text-black'>
            Create Station
          </h1>

          <form onSubmit={submit} className='space-y-4'>
            <div>
              <label className='block mb-2 font-medium text-gray-700'>Station Name</label>
              <input
                type='text'
                placeholder='Enter station name (e.g., Comilla High Speed Pump)'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isMapping}
                className='w-full border p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100'
              />
            </div>

            <div>
              <label className='block mb-2 font-medium text-gray-700'>Address</label>
              <input
                type='text'
                placeholder='Enter location text (e.g., Main Highway, Comilla, Bangladesh)'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={isMapping}
                className='w-full border p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100'
              />
            </div>

            <div>
              <label className='block mb-2 font-medium text-gray-700'>Capacity per slot</label>
              <input
                type='number'
                placeholder='Capacity'
                min={1}
                value={capacity || ''}
                disabled={isMapping}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCapacity(isNaN(val) ? 1 : val);
                }}
                required
                className='w-full border p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100'
              />
            </div>

            <button
              type='submit'
              disabled={isMapping}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg text-lg font-semibold transition flex justify-center items-center gap-2'
            >
              {isMapping ? 'Calculating Location Grid...' : 'Create Station'}
            </button>
          </form>

          {message && (
            <p className='mt-4 text-center text-sm text-red-600 font-medium bg-red-50 p-2 rounded-lg'>
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}