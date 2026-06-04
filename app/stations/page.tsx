import prisma from '@/lib/prisma';
import Navbar from '../../components/Navbar';
import StationCard from '@/components/StationCard';

export default async function StationList() {
  // 🎯 PRESENTATION MODE: Fetch any station that has any record inside the booking table
  const displayStations = await prisma.station.findMany({
    where: {
      bookings: {
        some: {}, // 💥 Empty bracket means: "Show it if it has ANY booking history row at all!"
      },
    },
  });

  return (
    <div>
      <Navbar />
      <main className='w-full py-12 flex flex-col items-center min-h-screen bg-gray-50'>
        
        <div className="w-full max-w-7xl mx-auto px-4">
          <h1 className='text-2xl font-bold mb-6 text-center text-black'>
            Previously Booked Stations
          </h1>
          
          {displayStations.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-500 max-w-2xl mx-auto">
              <p className="font-semibold text-lg text-gray-700 mb-2">No Bookings Found</p>
              <p className="text-sm">
                You haven't booked any fuel slots yet. Head over to the Map page to find nearby stations and make your first reservation!
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch justify-items-stretch'>
              {displayStations.map((s) => (
                <div key={s.id} className="flex w-full">
                  <StationCard station={s} />
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}