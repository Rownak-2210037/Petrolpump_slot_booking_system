
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;  
    console.log("ID:", id);

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const station = await prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    return NextResponse.json({ station });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
//update
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // await params
  const body = await req.json();
  const { name, address, capacity } = body;

  if (!name || !address || !capacity) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  try {
    const updatedStation = await prisma.station.update({
      where: { id },
      data: { name, address, capacity: Number(capacity) },
    });

    return NextResponse.json({ station: updatedStation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update station' }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // notice Promise here
) {
  // unwrap the promise
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Station ID is required" }, { status: 400 });
  }

  try {
    
    // DELETE station and its bookings manually
await prisma.booking.deleteMany({ where: { stationId: id } });
const deletedStation = await prisma.station.delete({ where: { id } });

    return NextResponse.json({
      message: "Station deleted successfully",
      station: deletedStation
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete station" },
      { status: 500 }
    );
  }
}