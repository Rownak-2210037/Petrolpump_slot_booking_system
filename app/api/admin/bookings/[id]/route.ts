import  { NextRequest,NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";



export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    if (!bookingId)
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });

    const clerkUser = await currentUser();
    if (!clerkUser)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { stations: true },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.role !== "ADMIN" ) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

   
    if (user.role !== "ADMIN") {
      if (!user.stations.some((s) => s.id === booking.stationId)) {
        return NextResponse.json(
          { error: "Not authorized for this station" },
          { status: 403 }
        );
      }
    }

    const { status } = await req.json();

    if (!["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}