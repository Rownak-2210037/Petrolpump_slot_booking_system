'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs'; 

import { Station } from '@/types/station';
import { Booking } from '@/types/booking';

export default function AdminDashboard() {
  const { getToken } = useAuth(); 
  const [activeTab, setActiveTab] = useState<'bookings' | 'stations'>('stations');
  
  // Data State Buckets
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingStations, setLoadingStations] = useState(true);

  // 🟢 Pagination States for Active Queue Table (6 Rows)
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(6); 
  const [totalActiveBookings, setTotalActiveBookings] = useState(0);

  // 📜 Pagination States for History Log Table (5 Rows)
  const [historyPage, setHistoryPage] = useState(1);
  const [totalHistoryBookings, setTotalHistoryBookings] = useState(0);
  const historyLimit = 5; 

  // 🔌 Fetch Bookings Pipeline Loop
  useEffect(() => {
    let isMounted = true; // 🛡️ Abort controller flag prevents updates on unmounted components

    async function fetchBookings() {
      setLoadingBookings(true);
      try {
        const token = await getToken();
        
        // 🎯 FIX: Explicitly pass method and disable browser network caching
        const res = await fetch(
          `/api/admin/bookings?page=${activePage}&limit=${limit}&historyPage=${historyPage}&historyLimit=${historyLimit}`,
          {
            method: 'GET',
            cache: 'no-store', // 🔥 CRITICAL FIX: Forces normal tabs to bypass local cache and request fresh server data
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch bookings');
        }
        const data = await res.json();
        
        if (isMounted) {
          setActiveBookings(data.bookings || []);
          setHistoryBookings(data.historyBookings || []);
          setTotalActiveBookings(data.total || 0);
          setTotalHistoryBookings(data.totalHistory || 0); 
        }
      } catch (err: any) {
        console.error("Fetch bookings error log:", err);
        if (isMounted) {
          toast.error(err.message || 'Failed to fetch bookings');
          setActiveBookings([]);
          setHistoryBookings([]);
        }
      } finally {
        if (isMounted) {
          setLoadingBookings(false);
        }
      }
    }
    
    fetchBookings();

    return () => {
      isMounted = false; // Cleanup execution stream on tab swap or fast navigation clicks
    };
  }, [activePage, historyPage, limit, historyLimit, getToken]); 

  // ⛽ Fetch Stations Pipeline Loop
  useEffect(() => {
    let isMounted = true;

    async function fetchStations() {
      try {
        const token = await getToken();
        const res = await fetch('/api/admin/stations', {
          method: 'GET',
          cache: 'no-store', // Bypass layout caching for stations too
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch stations');
        }
        const data = await res.json();
        if (isMounted) {
          setStations(data.stations || []);
        }
      } catch (err) {
        console.error("Fetch stations error log:", err);
        if (isMounted) {
          toast.error('Failed to fetch stations');
        }
      } finally {
        if (isMounted) {
          setLoadingStations(false);
        }
      }
    }
    
    fetchStations();

    return () => {
      isMounted = false;
    };
  }, [getToken]);

  // 🔄 Update Operational Row States (Complete / Cancel Actions)
  async function updateStatus(id: string, status: string) {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      toast.success('Status updated!');
      
      const updatedItem = activeBookings.find((b) => b.id === id);
      if (updatedItem) {
        const structuralCopy = { ...updatedItem, status };
        setActiveBookings((prev) => prev.filter((b) => b.id !== id));
        setHistoryBookings((prev) => [structuralCopy, ...prev]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error executing processing transaction');
    }
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <Navbar />
      <Toaster position='top-right' />

      <div className='flex flex-col md:flex-row'>
        {/* Sidebar Nav Links */}
        <aside className='w-full md:w-60 bg-white shadow p-4 flex md:flex-col justify-around md:justify-start'>
          <h1 className='text-xl font-bold mb-6 text-blue-600 hidden md:block'>
            Admin Dashboard
          </h1>
          <button
            className={`mb-2 p-3 w-full text-left rounded-lg transition-all hover:bg-blue-100 ${
              activeTab === 'stations' ? 'bg-blue-200 font-semibold text-blue-800' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('stations')}
          >
            Stations
          </button>
          <button
            className={`mb-2 p-3 w-full text-left rounded-lg transition-all hover:bg-blue-100 ${
              activeTab === 'bookings' ? 'bg-blue-200 font-semibold text-blue-800' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
        </aside>

        {/* Main Workspace Frame */}
        <main className='flex-1 p-6 space-y-8'>
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              
              {/* 🟢 TABLE SECTION A: ACTIVE LIVE QUEUE */}
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h1 className='text-xl font-bold text-blue-600'>Active Live Queue</h1>
                {loadingBookings ? (
                  <p className="text-sm text-gray-500 italic">Loading active records...</p>
                ) : activeBookings.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">No upcoming reservations inside your terminal nodes currently.</p>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200 text-center text-sm'>
                      <thead className='bg-gray-50 text-gray-500 uppercase text-xs tracking-wider'>
                        <tr>
                          <th className='px-6 py-3 font-semibold'>User</th>
                          <th className='px-6 py-3 font-semibold'>Station</th>
                          <th className='px-6 py-3 font-semibold'>Slot Time</th>
                          <th className='px-6 py-3 font-semibold'>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200 text-gray-700'>
                        {activeBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/50">
                            <td className='px-6 py-4'>{b?.user?.name || 'Unknown'}</td>
                            <td className='px-6 py-4'>{b?.station?.name}</td>
                            <td className='px-6 py-4 text-xs'>{new Date(b.slotTime).toLocaleString()}</td>
                            <td className='px-6 py-4 flex justify-center space-x-2'>
                              <button
                                className='bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 transition'
                                onClick={() => updateStatus(b.id, 'COMPLETED')}
                              >
                                Complete
                              </button>
                              <button
                                className='bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700 transition'
                                onClick={() => updateStatus(b.id, 'CANCELLED_BY_ADMIN')}
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Active Queue Pagination Controls */}
                    <div className='flex justify-between items-center mt-4 pt-2 text-xs border-t'>
                      <button
                        className='px-4 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-600 disabled:opacity-50 transition'
                        disabled={activePage === 1}
                        onClick={() => setActivePage((prev) => prev - 1)}
                      >
                        Previous
                      </button>
                      <span className='text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-md border'>
                        Page {activePage} of {totalActiveBookings ? Math.ceil(totalActiveBookings / limit) : 1}
                      </span>
                      <button
                        className='px-4 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-600 disabled:opacity-50 transition'
                        disabled={activePage >= (totalActiveBookings ? Math.ceil(totalActiveBookings / limit) : 1)}
                        onClick={() => setActivePage((prev) => prev + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 📜 TABLE SECTION B: HISTORICAL REGISTRY */}
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h1 className='text-xl font-bold text-emerald-600'>Full Stations History Log</h1>
                {loadingBookings ? (
                  <p className="text-sm text-gray-500 italic">Processing historic metrics...</p>
                ) : historyBookings.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">No historical events processed on your profile yet.</p>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200 text-center text-sm'>
                      <thead className='bg-gray-50 text-gray-500 uppercase text-xs tracking-wider'>
                        <tr>
                          <th className='px-6 py-3 font-semibold'>User</th>
                          <th className='px-6 py-3 font-semibold'>Station</th>
                          <th className='px-6 py-3 font-semibold'>Slot Time</th>
                          <th className='px-6 py-3 font-semibold'>Final Status</th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200 text-gray-600'>
                        {historyBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/50">
                            <td className='px-6 py-4'>{b?.user?.name || 'Unknown'}</td>
                            <td className='px-6 py-4'>{b?.station?.name}</td>
                            <td className='px-6 py-4 text-xs'>{new Date(b.slotTime).toLocaleString()}</td>
                            <td className='px-6 py-4 font-bold text-xs'>
                              <span className={`px-2.5 py-0.5 rounded-full text-white tracking-wide ${
                                b.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                {b.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* 🎯 INDEPENDENT HISTORY PAGINATION LOG CONTROLS */}
                    <div className='flex justify-between items-center mt-4 pt-2 text-xs border-t'>
                      <button
                        className='px-4 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-600 disabled:opacity-50 transition'
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage((prev) => prev - 1)}
                      >
                        Previous
                      </button>
                      <span className='text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-md border'>
                        Page {historyPage} of {totalHistoryBookings ? Math.ceil(totalHistoryBookings / historyLimit) : 1}
                      </span>
                      <button
                        className='px-4 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-600 disabled:opacity-50 transition'
                        disabled={historyPage >= (totalHistoryBookings ? Math.ceil(totalHistoryBookings / historyLimit) : 1)}
                        onClick={() => setHistoryPage((prev) => prev + 1)}
                      >
                        Next
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h1 className='text-xl font-bold mb-6 text-blue-600'>All Stations</h1>
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {stations.map((s) => (
                  <div
                    key={s.id}
                    className='p-4 border rounded-lg shadow-sm bg-white flex flex-col justify-between space-y-2 hover:shadow-md transition'
                  >
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800'>{s.name}</h3>
                      <p className='text-sm text-gray-500'>{s.address}</p>
                      <p className='text-sm text-gray-600 mt-1 font-medium'>Capacity per slot: {s.capacity}</p>
                    </div>
                    <Link
                      href={`/admin/stations/${s.id}`}
                      className='inline-block text-center mt-3 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-md hover:bg-blue-700 transition'
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}