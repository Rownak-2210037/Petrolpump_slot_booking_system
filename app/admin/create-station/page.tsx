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
  const router = useRouter(); // initialize router

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, capacity }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Failed');
        toast.error(data.error || 'Failed to create station');
      } else {
        toast.success('Station created successfully!');
        setName('');
        setAddress('');
        setCapacity(1);

        // Navigate to the newly created station's manage page
        router.push(`/admin/dashboard`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
      toast.error('Network error');
    }
  }

  return (
    <div>
      <Navbar />
      <Toaster position='top-right' />

      <main className='flex justify-center items-center min-h-screen bg-gray-100 px-4'>
        <div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-lg'>
          <h1 className='text-3xl font-bold mb-6 text-center'>
            Create Station
          </h1>

          <form onSubmit={submit} className='space-y-4'>
            <div>
              <label className='block mb-2 font-medium'>Station Name</label>
              <input
                type='text'
                placeholder='Enter station name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none'
              />
            </div>

            <div>
              <label className='block mb-2 font-medium'>Address</label>
              <input
                type='text'
                placeholder='Enter address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none'
              />
            </div>

            <div>
              <label className='block mb-2 font-medium'>Capacity</label>
              <input
                type='number'
                placeholder='Capacity'
                min={1}
                value={capacity || ''} // <- fix NaN error
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCapacity(isNaN(val) ? 1 : val); // default to 1 if NaN
                }}
                required
                className='w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none'
              />
            </div>

            <button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition'
            >
              Create Station
            </button>
          </form>

          {message && (
            <p className='mt-4 text-center text-green-600 font-medium'>
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
