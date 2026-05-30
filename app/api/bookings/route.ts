import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Resolve Clerk Authentication
    const session = await auth();
    let clerkUserId = session?.userId;

    // 2. Parse request variables from the incoming JSON payload
    const body = await req.json();
    const { stationId, slotTime, userId: fallbackClerkId } = body;

    // Use fallback ID if primary authentication session token is missing
    if (!clerkUserId) {
      clerkUserId = fallbackClerkId;
    }

    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated. Session missing." }, { status: 401 });
    }

    // 3. Locate the user profile record in Neon DB using clerkId
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

    // 🌏 TIMEZONE LOCK & ROUNDING LAYER
    // Convert the incoming date string to a valid JavaScript Date Object
    const incomingDate = new Date(slotTime);
    if (isNaN(incomingDate.getTime())) {
      return NextResponse.json({ error: "Invalid slot time" }, { status: 400 });
    }

    // 🎯 10-Minute Mathematical Bucketing Logic (Quantization)
    // Example: If user selects 1:34 PM, then (34 / 10) = 3.4 -> Floor to 3 -> 3 * 10 = 30 Minutes.
    const minutes = incomingDate.getMinutes();
    const roundedMinutes = Math.floor(minutes / 10) * 10;
    
    const targetSlotDate = new Date(incomingDate);
    targetSlotDate.setMinutes(roundedMinutes);
    targetSlotDate.setSeconds(0);
    targetSlotDate.setMilliseconds(0);

    // Generate a clean, absolute universal ISO string for database operations
    const isoStringUTC = targetSlotDate.toISOString();

    // 🚨 4. Capacity Filter Guard (Congestion & Overflow Prevention Lock)
    // Count how many active (PENDING) bookings currently exist in this specific 10-minute slot
    const existingBookingsCount = await prisma.booking.count({
      where: {
        stationId,
        status: "PENDING",
        slotTime: isoStringUTC, 
      },
    });

    // The maximum capacity threshold is set strictly to 10 vehicles per slot
    const MAX_CAPACITY_PER_SLOT = 10;

    if (existingBookingsCount >= MAX_CAPACITY_PER_SLOT) {
      // Format the time cleanly for user-friendly display in error messages (e.g., 07:30 AM)
      const formattedTime = targetSlotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return NextResponse.json({ 
        error: `This slot (${formattedTime}) is completely full! Maximum limit of ${MAX_CAPACITY_PER_SLOT} vehicles reached to avoid traffic lines. Please try selecting the next 10-minute interval slot.` 
      }, { status: 400 }); // Status 400 Client Error returns the validation block error text to frontend
    }

    // 5. Database Write Pipeline Transaction
    // Save the rounded 10-minute unique time window into the database schema row
    const booking = await prisma.booking.create({
      data: {
        stationId,
        userId,
        slotTime: isoStringUTC, 
      },
      include: {
        station: true, // Automatically include station metadata parameters for the real-time watcher
      }
    });

    // 🛠️ RESPONSE ENHANCEMENT: Attach direct Unix millisecond tags for instant watcher parsing
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
// 🔄 GET METHOD FOR THE BACKGROUND WATCHER COMPONENT
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

    // Fetch active pending booking sequences for the logged-in driver
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