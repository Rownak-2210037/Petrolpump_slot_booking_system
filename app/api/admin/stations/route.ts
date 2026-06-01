import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getDistanceKM } from "@/lib/geoUtils";

/**
 * ⛽ POST: Create a Station
 * Only Accessible by ADMIN and SUPER_ADMIN
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate with Clerk session token
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, address, capacity, latitude, longitude } = await req.json();

    // 2. Locate the admin user record in PostgreSQL
    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Strict security guard wall
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Not authorized to create stations" }, { status: 403 });
    }

    // 4. Create station record and link explicitly to this admin via relational data mapping
    const station = await prisma.station.create({
      data: {
        name,
        address,
        capacity: parseInt(capacity, 10) || 0,
        latitude: parseFloat(latitude) || 0.0,
        longitude: parseFloat(longitude) || 0.0,
        admins: { 
          connect: { id: user.id } 
        }, 
      },
      include: { admins: true },
    });

    console.log("🚀 Station created successfully and linked to admin:", station);
    return NextResponse.json({ success: true, station });

  } catch (err) {
    console.error("Critical station creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * 🗺️ GET: Fetch Stations with Proximity Distance Matrix Filter
 * Accessible by ADMIN, SUPER_ADMIN, and DRIVERS (for map rendering)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = getAuth(req); 
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Load active user profile and include their assigned stations structure array
    const dbUser = await prisma.user.findUnique({ 
      where: { clerkId: clerkUserId },
      include: { stations: true } 
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Parse URL coordinate parameters sent by the frontend map client
    const url = new URL(req.url);
    const userLatStr = url.searchParams.get("lat");
    const userLngStr = url.searchParams.get("lng");
    const radiusKM = 10; // 10 Kilometer radius scanning fence

    let stations: any[] = [];
    
    // 🎯 CRITICAL ROLE MATRIX SECURITY REWRITE:
    // This allows Drivers to fetch stations near them, otherwise the map renders blank!
    if (dbUser.role === "SUPER_ADMIN") {
      // Super admins view every single station in the global system database
      stations = await prisma.station.findMany({
        include: { admins: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (dbUser.role === "ADMIN") {
      // Standard station owners can only view their own assigned pumps
      stations = dbUser.stations || [];
    } else if (dbUser.role === "DRIVER") {
      // Drivers need to fetch ALL global stations so the backend math can see which ones are close to them
      stations = await prisma.station.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    // 3. Proximity Location Filtering Logic (Haversine Formula Check)
    if (userLatStr && userLngStr) {
      const userLat = parseFloat(userLatStr);
      const userLng = parseFloat(userLngStr);

      stations = stations.filter((station) => {
        // Skip records with missing, invalid, or corrupted coordinate values
        if (!station.latitude || !station.longitude) return false;

        // Run your mathematical geometric utility calculation
        const distance = getDistanceKM(userLat, userLng, station.latitude, station.longitude);
        
        // Return true only if the petrol pump sits within your 10 KM operational fence
        return distance <= radiusKM;
      });
    }

    return NextResponse.json({ stations });

  } catch (err) {
    console.error("Error running station GET collector:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}