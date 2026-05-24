'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! (Demo only)');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <Toaster position='top-right' />
      <main className='container mx-auto py-24 px-4 md:px-0 max-w-xl'>
        <h1 className='text-4xl md:text-5xl font-bold mb-6 text-center text-gray-800'>
          Contact Us
        </h1>
        <form
          onSubmit={handleSubmit}
          className='bg-white p-8 rounded-xl shadow space-y-4'
        >
          <input
            type='text'
            placeholder='Your Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
          <input
            type='email'
            placeholder='Email Address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
          <textarea
            placeholder='Message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className='w-full border p-3 rounded h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition'
          >
            Send Message
          </button>
        </form>
      </main>
    </div>
  );
}
