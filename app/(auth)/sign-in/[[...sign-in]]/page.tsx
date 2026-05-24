import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='w-full max-w-md p-6 bg-white rounded shadow'>
        <SignIn path='/sign-in' routing='path' signUpUrl='/sign-up' />
      </div>
    </div>
  );
}
