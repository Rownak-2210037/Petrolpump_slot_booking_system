
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";




export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { stations: true } 
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (admin.stations.length === 0) {
      return NextResponse.json({ bookings: [] }); 
    }

    const stationIds = admin.stations.map((s) => s.id);

    const bookings = await prisma.booking.findMany({
      where: { stationId: { in: stationIds } },
      include: { user: true, station: true },
      orderBy: { slotTime: "asc" },
    });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// PUT → update booking status
// export async function PUT(req: Request) {
//   try {
//     const clerkUser = await currentUser();
//     if (!clerkUser) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     const admin = await prisma.user.findUnique({
//       where: { clerkId: clerkUser.id },
//       include: { stations: true }
//     });

//     if (!admin) {
//       return NextResponse.json({ error: "Admin not found" }, { status: 404 });
//     }

//     const { id, status } = await req.json();

//     // Get booking
//     const booking = await prisma.booking.findUnique({
//       where: { id },
//     });

//     if (!booking) {
//       return NextResponse.json({ error: "Booking not found" }, { status: 404 });
//     }

//     // Check if admin manages the station of this booking
//     if (!admin.stations.some((s) => s.id === booking.stationId)) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//     }

//     const updatedBooking = await prisma.booking.update({
//       where: { id },
//       data: { status },
//     });

//     return NextResponse.json(updatedBooking);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const userId = user.id;

    const body = await req.json();
    const { stationId, slotTime } = body;

    if (!stationId || !slotTime) {
      return NextResponse.json({ error: "Station ID and slot time required" }, { status: 400 });
    }

    const date = new Date(slotTime);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid slot time" }, { status: 400 });
    }

    const exists = await prisma.booking.findFirst({
      where: { stationId, slotTime: date },
    });

    if (exists) {
      return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        stationId,
        userId,
        slotTime: date,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

