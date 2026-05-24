import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import prisma from '@/lib/prisma';

interface StationPageProps {
  params: { id: string };
}

export default async function StationPage({ params }: StationPageProps) {
  // unwrap params if it's a promise
  const resolvedParams = await params;
  const stationId = resolvedParams?.id;

  if (!stationId) {
    return (
      <div>
        <Navbar />
        <div className='container py-8'>Invalid Station ID</div>
      </div>
    );
  }

  const station = await prisma.station.findUnique({
    where: { id: stationId },
  });

  if (!station) {
    return (
      <div>
        <Navbar />
        <div className='container py-8'>Station not found</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className='container py-8'>
        <div className='bg-white p-6 rounded shadow'>
          <h1 className='text-2xl font-bold mb-2'>{station.name}</h1>
          <p className='text-gray-600 mb-4'>{station.address}</p>
          <div className='mt-6'>
            <BookingForm stationId={station.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
