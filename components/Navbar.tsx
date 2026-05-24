'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // DRIVER or ADMIN
  const { user } = useUser();

  useEffect(() => {
    async function syncUser() {
      const res = await fetch('/api/sync-user', { method: 'POST' });
      const data = await res.json();
      if (data.success) setUserRole(data.user.role); // store in state
    }
    syncUser();
  }, []);

  return (
    <nav className='bg-white shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          <div className='flex-shrink-0'>
            <Link href='/'>
              <h1 className='text-2xl font-bold text-blue-600'>FuelEase</h1>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-4 gap-2'>
            <Link
              href='/'
              className='block px-5 py-2 rounded-lg hover:bg-blue-700 transition'
            >
              Home
            </Link>
            <Link
              href='#about'
              className='block px-5 py-2 rounded-lg hover:bg-blue-700 transition'
            >
              About
            </Link>
            <Link
              href='#contact'
              className='block px-5 py-2 rounded-lg hover:bg-blue-700 transition'
            >
              Contact
            </Link>

            {/* Role-based links */}
            {userRole === 'DRIVER' && (
              <>
                <Link
                  href='/stations'
                  className='block px-5 py-2 rounded-lg hover:bg-blue-700 transition'
                >
                  Stations
                </Link>
                <Link
                  href='/my-bookings'
                  className='block px-5 py-2 rounded-lg hover:bg-blue-700 transition'
                >
                  My Bookings
                </Link>
              </>
            )}
            {userRole === 'ADMIN' && (
              <>
                <Link
                  href='/admin/dashboard'
                  className='block px-5 py-2 rounded-lg hover:bg-blue-700 transition'
                >
                  Admin Dashboard
                </Link>
                <Link
                  href='/admin/create-station'
                  className='block px-5 py-2 rounded-lg hover:bg-blue-700 transition'
                >
                  Create Station
                </Link>
              </>
            )}

            {/* Auth Buttons */}
            <SignedIn>
              <SignOutButton>
                <button className='px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition'>
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>

            <SignedOut>
              <SignInButton>
                <button className='px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition'>
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='text-gray-700 text-3xl focus:outline-none'
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className='md:hidden px-4 pt-4 pb-3 space-y-3 bg-gray-100 shadow'>
          <Link
            href='/'
            className='block px-5 py-3 rounded-lg hover:bg-blue-700 transition'
          >
            Home
          </Link>
          <Link
            href='/about'
            className='block px-5 py-3 rounded-lg hover:bg-blue-700 transition'
          >
            About
          </Link>
          <Link
            href='/contact'
            className='block px-5 py-3 rounded-lg hover:bg-blue-700 transition'
          >
            Contact
          </Link>

          {userRole === 'DRIVER' && (
            <>
              <Link
                href='/stations'
                className='block px-5 py-3 rounded-lg hover:bg-blue-700 transition'
              >
                Stations
              </Link>
              <Link
                href='/my-bookings'
                className='block px-5 py-3 rounded-lg hover:bg-blue-700 transition'
              >
                My Bookings
              </Link>
            </>
          )}
          {userRole === 'ADMIN' && (
            <>
              <Link
                href='/admin/dashboard'
                className='block px-5 py-3 rounded-lg hover:bg-blue-700 transition'
              >
                Admin Dashboard
              </Link>
              <Link
                href='/admin/create-station'
                className='block px-5 py-3 rounded-lg hover:bg-blue-700 transition'
              >
                Create Station
              </Link>
            </>
          )}

          {/* Auth */}
          <SignedIn>
            <SignOutButton>
              <button className='w-full px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition'>
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button className='w-full px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition'>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      )}
    </nav>
  );
}
