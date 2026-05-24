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
    if (!user) {
      toast.error('You must be logged in to book a slot.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          stationId,
          slotTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Slot not available');
      } else {
        toast.success('Booking successful!');
        setSlotTime('');
        router.push('/my-bookings');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-4'>
      <input
        type='datetime-local'
        value={slotTime}
        required
        onChange={(e) => setSlotTime(e.target.value)}
        className='border p-2 w-full'
      />
      <button
        type='submit'
        className='bg-blue-600 text-white px-4 py-2 rounded'
        disabled={loading}
      >
        {loading ? 'Booking...' : 'Book Slot'}
      </button>
    </form>
  );
}
