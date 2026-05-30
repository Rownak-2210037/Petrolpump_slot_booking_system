'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BookingForm({ stationId }: { stationId: string }) {
  const { user } = useUser();
  const [slotTime, setSlotTime] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    
    // 1. Authentication Check
    if (!user) {
      toast.error('You must be logged in to book a slot.');
      return;
    }

    if (!slotTime) {
      toast.error('Please select a valid date and time.');
      return;
    }

    setLoading(true);

    try {
      // 2. HTTP POST Request execution
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          stationId,
          // Converts the native input string value into an absolute universal UTC ISO string
          slotTime: new Date(slotTime).toISOString(), 
        }),
      });

      const data = await res.json();

      // 3. Response Status Evaluation Pipeline
      if (!res.ok) {
        // 🚨 Triggers the exact "This slot is full!" message directly inside your toast card layout
        toast.error(data.error || 'Slot not available');
      } else {
        toast.success('Booking successful!');
        setSlotTime('');
        
        // Push the driver smoothly to the bookings list view dashboard page
        router.push('/my-bookings');
        router.refresh();
      }
    } catch (err) {
      console.error("Network communication crash handler:", err);
      toast.error('Network error. Failed to reach verification server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-4 max-w-sm bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Select Arrival Time (10-Min Slots)
        </label>
        
        {/* 📅 Native 24-Hour OS Selector Element Input Field */}
        <input
          type='datetime-local'
          value={slotTime}
          required
          disabled={loading}
          onChange={(e) => setSlotTime(e.target.value)}
          className='w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50'
        />
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? 'Verifying Queue Space...' : 'Book Safe Fuel Slot'}
      </button>
    </form>
  );
}