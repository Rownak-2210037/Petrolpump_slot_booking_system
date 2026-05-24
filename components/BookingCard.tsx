'use client';
import React from 'react';
export default function BookingCard({
  booking,
  currentUser,
}: {
  booking: any;
  currentUser: any;
}) {
  const canUpdate =
    currentUser.role === 'ADMIN' && currentUser.stationId === booking.stationId;

  return (
    <div className='p-4 bg-white rounded shadow'>
      <p>
        <strong>Station:</strong> {booking.station?.name}
      </p>
      <p>
        <strong>User:</strong> {booking.user?.name}
      </p>
      <p>
        <strong>Slot:</strong> {new Date(booking.slotTime).toLocaleString()}
      </p>
      <p>
        <strong>Status:</strong>{' '}
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
      </p>
      {canUpdate && booking.status === 'PENDING' && (
        <div className='mt-2 space-x-2'>
          <button className='px-2 py-1 bg-green-500 text-white rounded'>
            Complete
          </button>
          <button className='px-2 py-1 bg-red-500 text-white rounded'>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
