'use client';
import React from 'react';

export default function BookingCardRow({
  booking,
  currentUser,
}: {
  booking: any;
  currentUser: any;
}) {
  const canUpdate =
    currentUser.role === 'ADMIN' &&
    currentUser.stations?.some((s: any) => s.id === booking.stationId);

  return (
    <tr className='border-b'>
      <td className='p-2'>{booking.station?.name}</td>

      <td className='p-2'>{booking.user?.name}</td>

      <td className='p-2'>{new Date(booking.slotTime).toLocaleString()}</td>

      <td className='p-2'>
        <span
          className={`px-2 py-1 rounded text-white ${
            booking.status === 'PENDING'
              ? 'bg-yellow-500'
              : booking.status === 'COMPLETED'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        >
          {booking.status}
        </span>
      </td>

      {/* Booked At */}
      <td className='p-2'>{new Date(booking.createdAt).toLocaleString()}</td>

      {/* Admin Actions */}
      {currentUser.role !== 'DRIVER' && (
        <td className='p-2 space-x-2'>
          {booking.status === 'PENDING' && canUpdate && (
            <>
              <button className='px-2 py-1 bg-green-500 text-white rounded'>
                Complete
              </button>
              <button className='px-2 py-1 bg-red-500 text-white rounded'>
                Cancel
              </button>
            </>
          )}
        </td>
      )}
    </tr>
  );
}
