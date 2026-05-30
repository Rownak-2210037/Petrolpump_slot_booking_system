'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BookingCard({
  booking,
  currentUser,
}: {
  booking: any;
  currentUser: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 🕒 Evaluates if the slot is within the strict 30-minute cancellation boundary
  const currentTimeMs = Date.now();
  const scheduledSlotTimeMs = new Date(booking.slotTime).getTime();
  const timeDifferenceInMinutes = (scheduledSlotTimeMs - currentTimeMs) / (1000 * 60);
  const isWithinThirtyMinutes = timeDifferenceInMinutes < 30;

  async function handleDriverCancel() {
    // Structural confirmation check before executing mutation pipeline
    if (!confirm('Are you sure you want to cancel this fuel booking slot?')) return;

    setLoading(true);
    try {
      // 🔗 Hits your newly created standalone driver cancellation API route folder
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (!res.ok) {
        // Intercepts and fires back standard policy lockout error notifications
        toast.error(data.error || 'Failed to cancel slot.');
      } else {
        toast.success('Your reservation has been cancelled successfully.');
        router.refresh();
      }
    } catch (err) {
      console.error('Driver cancellation dispatch failure:', err);
      toast.error('Network error. Failed to reach verification server.');
    } finally {
      setLoading(false);
    }
  }

  // Helper utility function mapping custom styling templates cleanly based on state fields
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED_BY_DRIVER': return 'bg-orange-600'; // 🎯 Synced with database status string key
      case 'CANCELLED_BY_ADMIN': return 'bg-red-600';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className='p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4'>
      <div className="space-y-1">
        <p className="text-sm text-slate-700">
          <strong>Station:</strong> {booking.station?.name}
        </p>
        <p className="text-sm text-slate-700">
          <strong>User:</strong> {booking.user?.name}
        </p>
        <p className="text-sm text-slate-700">
          <strong>Slot:</strong> {new Date(booking.slotTime).toLocaleString()}
        </p>
        <div className="pt-1">
          <strong>Status:</strong>{' '}
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white tracking-wide shadow-sm ${getStatusStyle(booking.status)}`}>
            {booking.status === 'CANCELLED_BY_DRIVER' ? 'Cancelled By Driver' : 
             booking.status === 'CANCELLED_BY_ADMIN' ? 'Cancelled By Admin' : 
             booking.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 🏎️ Driver Action Interface Zone */}
      {booking.status === 'PENDING' && currentUser.role === 'DRIVER' && (
        <div className='w-full'>
          <button
            onClick={handleDriverCancel}
            disabled={loading || isWithinThirtyMinutes}
            className={`w-full py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm
              ${isWithinThirtyMinutes 
                ? 'bg-gray-300 cursor-not-allowed opacity-70 border border-gray-200 text-gray-500' 
                : 'bg-rose-500 hover:bg-rose-600'
              }`}
            title={isWithinThirtyMinutes ? "Cannot cancel within 30 minutes of scheduled window." : "Cancel Booking"}
          >
            {loading ? 'Processing Hold...' : isWithinThirtyMinutes ? 'Can not be cancelled' : 'Cancel Booking'}
          </button>
        </div>
      )}
    </div>
  );
}