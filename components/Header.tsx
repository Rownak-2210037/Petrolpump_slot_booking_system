'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header className='p-4 flex justify-between items-center bg-gray-100'>
      <h1 className='text-xl font-bold'>
        <Link href='/'>FuelEase</Link>
      </h1>
      {isSignedIn ? (
        <div className='flex items-center gap-4'>
          <span>{user?.firstName}</span>
          <SignOutButton>
            <button className='px-3 py-1 bg-red-600 text-white rounded'>
              Sign Out
            </button>
          </SignOutButton>
        </div>
      ) : (
        <Link
          href='/sign-in'
          className='px-3 py-1 bg-blue-600 text-white rounded'
        >
          Sign In
        </Link>
      )}
    </header>
  );
}
