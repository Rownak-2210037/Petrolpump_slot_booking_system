import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development mode
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'], // Only log critical errors to keep the console clean
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Reuse the global instance if it exists, otherwise create a new one
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;