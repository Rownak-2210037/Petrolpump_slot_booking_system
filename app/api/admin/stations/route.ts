import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // 🛠️ CHANGED: Switched from currentUser to auth
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Read session tokens directly from secure browser cookies
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, address, capacity } = await req.json();

    // 2. Find the admin user in the Neon DB using the secure clerkUserId string
    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Strict security check
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // 4. Safely create the new station and link it directly to this Admin profile row
    const station = await prisma.station.create({
      data: {
        name,
        address,
        capacity: parseInt(capacity) || 0, // Ensure it parses cleanly to an integer number
        admins: { 
          connect: { id: user.id } 
        }, 
      },
      include: { admins: true },
    });

    console.log("Station created successfully with linked admins:", station);
    return NextResponse.json({ success: true, station });

  } catch (err) {
    console.error("Critical station creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth(); // 🛠️ CHANGED: Switched from currentUser to auth
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ 
      where: { clerkId: clerkUserId },
      include: { stations: true } 
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    let stations;
    if (dbUser.role === "ADMIN") {
      stations = await prisma.station.findMany({
        include: { admins: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      stations = dbUser.stations;
    }

    return NextResponse.json({ stations });

  } catch (err) {
    console.error("Error running station GET collector:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}