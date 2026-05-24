// lib/getCurrentUser.ts
import prisma from './prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function getCurrentUser() {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
  return dbUser;
}
