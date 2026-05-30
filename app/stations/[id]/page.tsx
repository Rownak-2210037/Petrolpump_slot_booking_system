import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import prisma from '@/lib/prisma';

interface StationPageProps {
  params: { id: string };
}

export default async function StationPage({ params }: StationPageProps) {
  // 1. Safely unwrap params to handle dynamic Next.js runtime routing
  const resolvedParams = await params;
  const stationId = resolvedParams?.id;

  if (!stationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className='container mx-auto py-12 px-4 text-center text-red-500 font-medium'>
          ⚠️ Invalid Station Identification Parameters
        </div>
      </div>
    );
  }

  // 2. Fetch the specific station profile from the Neon PostgreSQL Database
  const station = await prisma.station.findUnique({
    where: { id: stationId },
  });

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className='container mx-auto py-12 px-4 text-center text-gray-500 font-medium'>
          ❌ The requested fuel station profile could not be located.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className='container mx-auto py-12 px-4 max-w-4xl'>
        {/* Two-Column Responsive Layout Engine Split */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Left Side: Station Details & Metadata Display Card */}
          <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block mb-1">
              Station Profile Details
            </span>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>
              {station.name}
            </h1>
            
            {/* 🎯 FIXED LINE: Changed from station.location to station.address */}
            <p className='text-slate-600 flex items-center gap-2 mb-4 text-sm'>
              📍 <span className="font-medium">{station.address || "Address configuration missing"}</span>
            </p>
            
            <hr className="my-4 border-gray-100" />
            
            {/* Displaying the hourly capacity directly on screen */}
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <span className="text-xs font-semibold text-blue-700 uppercase block mb-1">
                Operational Efficiency Metrics
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                   Max capacity: <span className="font-bold text-slate-800">{station.capacity || 5} vehicles</span> per 10-minute slot window.
              </p>
            </div>
          </div>

          {/* Right Side: Your Updated 24-Hour Input Booking Form Component */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 md:p-0 md:bg-transparent md:border-none md:shadow-none">
            <BookingForm stationId={station.id} />
          </div>

        </div>
      </main>
    </div>
  );
}