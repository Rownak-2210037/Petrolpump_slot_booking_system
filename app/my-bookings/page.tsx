import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import BookingCard from '@/components/BookingCard';
import BookingCardRow from '@/components/BookingCardRow';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// 🚀 force dynamic execution to bypass cached reads
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MyBookings({ searchParams }: PageProps) {
  const user = await currentUser();
  if (!user) return <p className='p-8 text-center text-gray-600 font-medium'>Please login to view bookings.</p>;

  // 1. Resolve server query parameters safely
  const resolvedParams = await searchParams;
  const currentPage = parseInt(resolvedParams.page || '1', 10);
  const itemsPerPage = 5; // 🎯 Displaying exactly 5 rows per page split

  // 2. Fetch user profile record configurations
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { stations: true },
  });

  if (!dbUser) {
    return redirect('/api/sync-user');
  }

  let bookings = [];

  // 3. Execution matrix to collect raw user booking history rows
  if (dbUser.role === 'DRIVER') {
    bookings = await prisma.booking.findMany({
      where: { userId: dbUser.id },
      include: { station: true, user: true },
      orderBy: { slotTime: 'desc' },
    });
  } else if (dbUser.role === 'ADMIN') {
    const stationIds = dbUser.stations.map((s) => s.id);
    bookings = await prisma.booking.findMany({
      where: {
        stationId: { in: stationIds },
      },
      include: { station: true, user: true },
      orderBy: { slotTime: 'desc' },
    });
  } else {
    bookings = await prisma.booking.findMany({
      include: { station: true, user: true },
      orderBy: { slotTime: 'desc' },
    });
  }

  // 4. Timing data distribution filters
  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.slotTime) > now);
  const past = bookings.filter((b) => new Date(b.slotTime) <= now);

  // 🎯 STEP 5: SERVER-SIDE PAGINATION ARITHMETIC SLICING
  const totalHistoryItems = past.length;
  const totalPages = Math.ceil(totalHistoryItems / itemsPerPage) || 1;
  
  // Calculate boundary indexes
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Slice target subset matching active view window index
  const paginatedPastBookings = past.slice(startIndex, endIndex);

  return (
    <div className='min-h-screen bg-gray-100'>
      <Navbar />
      <main className='container mx-auto py-8 px-4'>
        <h1 className='text-3xl font-bold mb-6 text-gray-800'>My Bookings Dashboard</h1>

        {/* 🚨 Upcoming Bookings Section */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-blue-600 flex items-center gap-2'>
            Upcoming & Active Bookings
          </h2>
          {upcoming.length === 0 ? (
            <p className="bg-white p-4 rounded shadow text-gray-500 text-sm">No upcoming bookings right now.</p>
          ) : (
            <div className='grid md:grid-cols-2 gap-4'>
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} currentUser={dbUser} />
              ))}
            </div>
          )}
        </section>

        {/* 📜 Past & Complete History Section */}
        <section>
          <h2 className='text-2xl font-semibold mb-4 text-emerald-600 flex items-center gap-2'>
            Full Bookings History Table
          </h2>
          {totalHistoryItems === 0 ? (
            <p className="bg-white p-4 rounded shadow text-gray-500 text-sm">No historical logs found.</p>
          ) : (
            <div className="space-y-4">
              <div className='overflow-x-auto rounded-lg shadow border border-gray-200 bg-white'>
                <table className='w-full'>
                  <thead className='bg-gray-200 border-b border-gray-300 text-gray-700 text-sm'>
                    <tr>
                      <th className='p-3 text-left font-semibold'>Station Name</th>
                      <th className='p-3 text-left font-semibold'>Driver/User</th>
                      <th className='p-3 text-left font-semibold'>Reserved Slot</th>
                      <th className='p-3 text-left font-semibold'>Status</th>
                      <th className='p-3 text-left font-semibold'>Booked At</th>
                      {dbUser.role !== 'DRIVER' && (
                        <th className='p-3 text-center font-semibold'>Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100 text-sm text-gray-600'>
                    {paginatedPastBookings.map((b) => {
                      // Visual backup injector to clean raw pending strings 
                      const modifiedBooking = {
                        ...b,
                        status: b.status === 'PENDING' ? ('COMPLETED' as const) : b.status
                      };

                      return (
                        <BookingCardRow
                          key={b.id}
                          booking={modifiedBooking}
                          currentUser={dbUser}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 🎯 BEAUTIFUL COMPONENT PAGINATION TOOLBAR CONTROLS */}
              <div className='flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold shadow-sm text-gray-600'>
                {currentPage > 1 ? (
                  <Link
                    href={`/my-bookings?page=${currentPage - 1}`}
                    className='px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm'
                  >
                    🡨 Previous
                  </Link>
                ) : (
                  <button
                    disabled
                    className='px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed'
                  >
                    🡨 Previous
                  </button>
                )}

                <span className='bg-gray-50 border px-3 py-1.5 rounded-md text-gray-500 font-medium'>
                  Page {currentPage} of {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`/my-bookings?page=${currentPage + 1}`}
                    className='px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm'
                  >
                    Next 🡪
                  </Link>
                ) : (
                  <button
                    disabled
                    className='px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed'
                  >
                    Next 🡪
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}