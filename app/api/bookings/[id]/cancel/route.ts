import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Resolve Clerk Authentication token sessions
    const session = await auth();
    const clerkUserId = session?.userId;
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized access attempt" }, { status: 401 });
    }

    // Safely unwrap dynamic route routing parameters
    const resolvedParams = await params;
    const bookingId = resolvedParams?.id;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // 2. Locate the specific targeted booking record inside Neon DB
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking entry not found" }, { status: 404 });
    }

    // 🕒 3. THE 30-MINUTE REGULATORY POLICY TIME CHECK
    const currentTimeMs = Date.now();
    const scheduledSlotTimeMs = new Date(booking.slotTime).getTime();
    const timeDifferenceInMinutes = (scheduledSlotTimeMs - currentTimeMs) / (1000 * 60);

    // If less than 30 minutes remain, trigger a policy lockout protection block
    if (timeDifferenceInMinutes < 30) {
      return NextResponse.json({ 
        error: "Policy Lockout: Slot adjustments are restricted within 30 minutes of scheduled arrival." 
      }, { status: 400 });
    }

    // 4. Execute Database Write Transaction using your new custom string value
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      // 🎯 FIXED: This matches your exact requested system tag tracking code parameter
      data: { status: "CANCELLED_BY_USER" }, 
    });

    return NextResponse.json({ success: true, booking: updatedBooking }, { status: 200 });

  } catch (err) {
    console.error("Critical error in driver cancellation pipeline:", err);
    return NextResponse.json({ error: "Internal Server error" }, { status: 500 });
  }
}