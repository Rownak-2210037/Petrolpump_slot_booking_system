import prisma from '@/lib/prisma';
import Navbar from '../../components/Navbar';
import StationCard from '@/components/StationCard';

export default async function StationList() {
  const stations = await prisma.station.findMany({ take: 50 });

  return (
    <div>
      <Navbar />
      <main className='container py-12 flex flex-col items-center'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Nearby Stations</h1>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center'>
          {stations.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </div>
      </main>
    </div>
  );
}
