'use client';

import Navbar from '@/components/Navbar';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />

      {/* Hero Section */}
      <section
        id='home'
        className='relative flex flex-col items-center justify-center text-center py-24 px-4 md:px-0 bg-gradient-to-r from-blue-300 to-blue-500 text-white'
      >
        <h1 className='text-4xl md:text-6xl font-bold mb-6'>
          Fuel Booking Made Easy
        </h1>
        <p className='text-lg md:text-xl max-w-2xl mb-8'>
          Reserve your CNG, Petrol, or Diesel fuel slots in advance and avoid
          long queues. Track your bookings and refill on time.
        </p>
        <a
          href='/sign-up'
          className='bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-800 transition'
        >
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section id='features' className='py-16 px-4 md:px-0 max-w-7xl mx-auto'>
        <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>
          Features
        </h2>
        <div className='grid md:grid-cols-3 gap-8 text-center'>
          <div className='p-6 bg-white rounded-xl shadow hover:shadow-lg transition'>
            <h3 className='text-xl font-semibold mb-2'>Book Slots</h3>
            <p className='text-gray-600'>
              Reserve your fuel slot in advance and save time.
            </p>
          </div>
          <div className='p-6 bg-white rounded-xl shadow hover:shadow-lg transition'>
            <h3 className='text-xl font-semibold mb-2'>Real-Time Tracking</h3>
            <p className='text-gray-600'>
              Track your booking status and get notifications.
            </p>
          </div>
          <div className='p-6 bg-white rounded-xl shadow hover:shadow-lg transition'>
            <h3 className='text-xl font-semibold mb-2'>Cancel / Reschedule</h3>
            <p className='text-gray-600'>
              Manage your slots easily with cancel or reschedule options.
            </p>
          </div>
        </div>
      </section>

      {/* Imported About & Contact */}
      <AboutSection />
      <ContactSection />
    </div>
  );
}
