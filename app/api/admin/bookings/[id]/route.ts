import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Explicit TypeScript Interface mapping for safety checks
interface StationRelation {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  createdAt: Date;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Safely unwrap dynamic route parameters
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // 2. Resolve Clerk User Authentication
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 3. 🎯 FIXED: Clean include block. Prisma automatically references "AdminStations" here!
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { stations: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Strict Authorization check: Ensure only ADMIN or SUPER_ADMIN users can access this endpoint
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // 4. Locate the specific booking entry
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 5. 🎯 FIXED: Station-Ownership Authorization Validation Guard with explicit typing
    if (user.role === "ADMIN") {
      const hasAccess = user.stations.some((s: StationRelation) => s.id === booking.stationId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: "Not authorized for this station" },
          { status: 403 }
        );
      }
    }

    // 6. Parse incoming request body payload variables
    const { status } = await req.json();

    // Allowed status validation strings
    const validStatuses = [
      "PENDING", 
      "COMPLETED", 
      "CANCELLED", 
      "CANCELLED_BY_USER", 
      "CANCELLED_BY_DRIVER", 
      "CANCELLED_BY_ADMIN"
    ];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status state payload" }, { status: 400 });
    }

    // 7. Execute Database Write Transaction Update Pipeline
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ success: true, booking: updatedBooking }, { status: 200 });
  } catch (err) {
    console.error("Critical admin booking pipeline error:", err);
    return NextResponse.json({ error: "Internal Server error" }, { status: 500 });
  }
}