import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import BookingCard from '@/components/BookingCard';
import BookingCardRow from '@/components/BookingCardRow';

export default async function MyBookings() {
  const user = await currentUser();
  if (!user) return <p className='p-8'>Please login to view bookings.</p>;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { stations: true },
  });

  if (!dbUser) return <p className='p-8'>User not found in DB.</p>;

  let bookings = [];

  if (dbUser.role === 'DRIVER') {
    // Drivers see their own bookings
    bookings = await prisma.booking.findMany({
      where: { userId: dbUser.id },
      include: { station: true, user: true },
      orderBy: { slotTime: 'desc' },
    });
  } else if (dbUser.role === 'ADMIN') {
    // Admin → can manage multiple stations
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

  const now = new Date();
  const upcoming = bookings.filter((b) => b.slotTime > now);
  const past = bookings.filter((b) => b.slotTime <= now);

  return (
    <div className='min-h-screen bg-gray-100'>
      <Navbar />
      <main className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold mb-6'>My Bookings</h1>

        {/* Upcoming Bookings */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Upcoming Bookings</h2>
          {upcoming.length === 0 ? (
            <p>No upcoming bookings.</p>
          ) : (
            <div className='grid md:grid-cols-2 gap-4'>
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} currentUser={dbUser} />
              ))}
            </div>
          )}
        </section>

        {/* Past Bookings */}
        <section>
          <h2 className='text-2xl font-semibold mb-4'>Past Bookings</h2>
          {past.length === 0 ? (
            <p>No past bookings.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full bg-white rounded shadow'>
                <thead className='bg-gray-200'>
                  <tr>
                    <th className='p-2 text-left'>Station</th>
                    <th className='p-2 text-left'>User</th>
                    <th className='p-2 text-left'>Slot</th>
                    <th className='p-2 text-left'>Status</th>
                    <th className='p-2 text-left'>Booked At</th>
                    {dbUser.role !== 'DRIVER' && (
                      <th className='p-2'>Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {past.map((b) => (
                    <BookingCardRow
                      key={b.id}
                      booking={b}
                      currentUser={dbUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
