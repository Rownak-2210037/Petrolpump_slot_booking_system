'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BookingCardRow({
  booking,
  currentUser,
}: {
  booking: any;
  currentUser: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Checks if the logged-in admin owns the station this booking belongs to
  const canUpdate =
    currentUser.role === 'ADMIN' &&
    currentUser.stations?.some((s: any) => s.id === booking.stationId);

  async function handleAdminAction(targetStatus: 'COMPLETED' | 'CANCELLED_BY_ADMIN') {
    if (targetStatus === 'CANCELLED_BY_ADMIN') {
      const confirmEmergency = confirm('🚨 Emergency Override: Signal immediate cancellation for this vehicle queue slot allocation?');
      if (!confirmEmergency) return;
    }

    setLoading(true);
    try {
      // 🔗 Communicates with your recently modified administrative state machine endpoint
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to update administrative state parameters.');
      } else {
        toast.success(`Slot successfully marked as ${targetStatus === 'COMPLETED' ? 'Completed' : 'Cancelled by Emergency'}`);
        router.refresh();
      }
    } catch (err) {
      console.error('Administrative state adjustment transaction crash:', err);
      toast.error('Network pipeline validation error.');
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED_BY_DRIVER': return 'bg-orange-600'; 
      case 'CANCELLED_BY_USER': return 'bg-red-500'; // 🎯 FIXED: Added color for your user page cancel string
      case 'CANCELLED_BY_ADMIN': return 'bg-red-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <tr className='border-b hover:bg-slate-50/50 transition-colors text-sm text-slate-600'>
      <td className='p-3 font-medium text-slate-800'>{booking.station?.name}</td>
      <td className='p-3'>{booking.user?.name}</td>
      <td className='p-3'>{new Date(booking.slotTime).toLocaleString()}</td>
      
      <td className='p-3'>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white tracking-wide shadow-sm ${getStatusStyle(booking.status)}`}>
          {booking.status === 'CANCELLED_BY_DRIVER' ? 'Cancelled By Driver' : 
           booking.status === 'CANCELLED_BY_USER' ? 'Cancelled By User' : // 🎯 FIXED: Maps text label clean layout
           booking.status === 'CANCELLED_BY_ADMIN' ? 'Cancelled By Admin' : 
           booking.status.replace(/_/g, ' ')}
        </span>
      </td>

      <td className='p-3 text-xs text-slate-400'>{new Date(booking.createdAt).toLocaleString()}</td>

      {/* 🛡️ Administrative Action Core Interface Execution Block */}
      {currentUser.role !== 'DRIVER' && (
        <td className='p-3 text-center'>
          {booking.status === 'PENDING' && canUpdate ? (
            <div className="flex items-center justify-start gap-2">
              <button 
                onClick={() => handleAdminAction('COMPLETED')}
                disabled={loading}
                className='px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm disabled:opacity-50'
              >
                Accept
              </button>
              <button 
                onClick={() => handleAdminAction('CANCELLED_BY_ADMIN')}
                disabled={loading}
                className='px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm disabled:opacity-50'
              >
                Cancel Slot
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-300 italic">No actions pending</span>
          )}
        </td>
      )}
    </tr>
  );
}