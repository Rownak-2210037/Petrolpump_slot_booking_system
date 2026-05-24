import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 
    const { status } = await req.json();

    // Validate status
    if (!["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Auth check
    const clerkUser = await currentUser();
    if (!clerkUser)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Is this admin?
    const admin = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { stations: true },
    });

    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Authorization check
    if (!admin.stations.some((s) => s.id === booking.stationId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
