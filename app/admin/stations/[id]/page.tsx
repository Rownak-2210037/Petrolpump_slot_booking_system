'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import { Booking } from '@/types/booking';
import { Station } from '@/types/station';

export default function ManageStation() {
  const params = useParams();
  const stationId = params?.id;
  const router = useRouter();

  const [station, setStation] = useState<Station | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  //const [capacity, setCapacity] = useState<number>(0);
  const [capacity, setCapacity] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const resStation = await fetch(`/api/admin/stations/${stationId}`);
        const stationData = await resStation.json();

        if (!resStation.ok) throw new Error(stationData.error);

        setStation(stationData.station);
        // Prefill the form
        setName(stationData.station.name);
        setAddress(stationData.station.address);
        setCapacity(stationData.station.capacity);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (stationId) fetchData();
  }, [stationId]);

  // Update station
  const handleUpdate = async () => {
    if (!name || !address || !capacity) {
      toast.error('All fields are required');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/stations/${stationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          capacity: Number(capacity), // convert here
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Station updated successfully!');
      router.push('/admin/dashboard?tab=stations'); // go back to stations list
    } catch (err: any) {
      toast.error(err.message || 'Failed to update station');
    } finally {
      setUpdating(false);
    }
  };

  // Delete station
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/stations/${stationId}`, {
        method: 'DELETE',
      });

      const data = await res.json(); // now this will always work

      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || 'Station deleted successfully');
      router.push('/admin/dashboard'); // redirect to station list
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete station');
    }
  };

  if (loading) return <p className='p-6'>Loading station info...</p>;
  if (!station) return <p className='p-6 text-red-600'>Station not found</p>;

  return (
    <div className='p-6'>
      <Toaster position='top-right' />

      <h1 className='text-2xl font-bold mb-4 text-blue-600'>
        Manage Station: {station.name}
      </h1>

      <div className='mb-6 bg-white p-4 rounded shadow'>
        <label className='block mb-2'>Name:</label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='border p-2 rounded w-full mb-4'
        />

        <label className='block mb-2'>Address:</label>
        <input
          type='text'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className='border p-2 rounded w-full mb-4'
        />

        <label className='block mb-2'>Capacity:</label>
        <input
          type='number'
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className='border p-2 rounded w-full mb-4'
        />
        <div className='flex gap-4'>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          >
            {updating ? 'Updating...' : 'Update Station'}
          </button>
          <button
            onClick={handleDelete}
            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
          >
            Delete Station
          </button>
        </div>
      </div>

      {/* Bookings */}
      <h2 className='text-xl font-semibold mb-2'>Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet for this station.</p>
      ) : (
        <div className='overflow-x-auto bg-white rounded shadow p-4'>
          <table className='min-w-full divide-y divide-gray-200 text-center'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-2'>User</th>
                <th className='px-4 py-2'>Slot Time</th>
                <th className='px-4 py-2'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className='px-4 py-2'>{b.user.name}</td>
                  <td className='px-4 py-2'>
                    {new Date(b.slotTime).toLocaleString()}
                  </td>
                  <td className='px-4 py-2'>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
