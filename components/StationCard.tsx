// components/StationCard.tsx
import Link from 'next/link';

export default function StationCard({ station }: { station: any }) {
  if (!station?.id) return null; // safety check

  return (
    <div className='p-6 bg-gray-300 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 hover:scale-105 duration-300'>
      <div className='flex flex-col h-full justify-between'>
        <div>
          <h3 className='text-xl font-bold text-black mb-2'>{station.name}</h3>
          <p className='text-black font-bold mb-4'>{station.address}</p>
          <p className='text-sm text-black'>Capacity: {station.capacity}</p>
        </div>

        <Link
          href={`/stations/${station.id}`}
          className='mt-4 w-full inline-block text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition'
        >
          View & Book
        </Link>
      </div>
    </div>
  );
}
