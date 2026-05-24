import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, address, latitude, longitude, capacity } = body;

  if (!name || !capacity) {
    return NextResponse.json({ error: 'Name and capacity are required' }, { status: 400 });
  }

  const station = await prisma.station.create({
    data: { name, address, latitude, longitude, capacity },
  });

  return NextResponse.json(station);
}
export async function GET() {
  const stations = await prisma.station.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(stations);
}
