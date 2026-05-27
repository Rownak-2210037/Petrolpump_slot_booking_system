import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Resolve Clerk Authentication
    const session = await auth();
    let clerkUserId = session?.userId;

    // 2. Parse request variables
    const body = await req.json();
    const { stationId, slotTime, userId: fallbackClerkId } = body;

    if (!clerkUserId) {
      clerkUserId = fallbackClerkId;
    }

    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated. Session missing." }, { status: 401 });
    }

    // 3. Locate the profile record in Neon DB
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User profile row not initialized in database." }, { status: 404 });
    }

    const userId = user.id;

    if (!stationId || !slotTime) {
      return NextResponse.json({ error: "Station ID and slot time required" }, { status: 400 });
    }

    // 🌏 TIMEZONE LOCK LAYER: Standardize incoming date into absolute global format
    const date = new Date(slotTime);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid slot time" }, { status: 400 });
    }

    // Convert to a clean absolute universal ISO string for strict transactional collision lookups
    const isoStringUTC = date.toISOString();

    // 4. Collision Guard: Check if anyone else holds this slot allocation window
    const exists = await prisma.booking.findFirst({
      where: { 
        stationId, 
        slotTime: isoStringUTC 
      },
    });

    if (exists) {
      return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
    }

    // 5. Database Write Pipeline Transaction
    const booking = await prisma.booking.create({
      data: {
        stationId,
        userId,
        slotTime: isoStringUTC, // Force save in clean universal UTC standard formatting
      },
      include: {
        station: true, // Automatically pull station metadata parameters for the watcher component
      }
    });

    // 🛠️ RESPONSE ENHANCEMENT: Attach direct Unix millisecond tags 
    // This allows the background watcher to compute time gaps instantly without parsing errors!
    const responsePayload = {
      ...booking,
      slotTimeMs: new Date(booking.slotTime).getTime(),
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (err) {
    console.error("Critical error in booking pipeline:", err);
    return NextResponse.json({ error: "Internal Server error" }, { status: 500 });
  }
}

// =========================================================================
// 🔄 ADDING THE GET METHOD FOR THE BACKGROUND WATCHER COMPONENT
// =========================================================================
export async function GET() {
  try {
    const session = await auth();
    const clerkUserId = session?.userId;

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User mismatch logs" }, { status: 404 });
    }

    // Fetch active pending booking sequences
    const activeBookings = await prisma.booking.findMany({
      where: { 
        userId: user.id,
        status: "PENDING"
      },
      include: { station: true },
      orderBy: { slotTime: "asc" },
    });

    // Map through array objects to inject universal millisecond integers
    const bookingsWithTimestamps = activeBookings.map((b) => ({
      ...b,
      slotTimeMs: new Date(b.slotTime).getTime(),
    }));

    return NextResponse.json({ bookings: bookingsWithTimestamps });
  } catch (err) {
    console.error("Failed executing watcher lookup sequences:", err);
    return NextResponse.json({ error: "Internal server compilation data error" }, { status: 500 });
  }
}