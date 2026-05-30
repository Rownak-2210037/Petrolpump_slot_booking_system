import { NextResponse,NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server"; // 🎯 FIX: Changed from currentUser to getAuth to extract bearer headers natively
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // 🟢 1. Active Queue Pagination Parameters
    const activePage = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "6", 10); // Active table size limit (6)
    const activeSkip = (activePage - 1) * limit;

    // 📜 2. History Log Pagination Parameters 
    const historyPage = parseInt(url.searchParams.get("historyPage") || "1", 10);
    const historyLimit = parseInt(url.searchParams.get("historyLimit") || "5", 10); 
    const historySkip = (historyPage - 1) * historyLimit; 

    // 🎯 FIX AUTHENTICATION CRASHES:
    // Read the cryptographically signed JWT token sent from the client-side useAuth() block
    const { userId } = getAuth(req); 
    
    if (!userId) {
      console.error("Authentication Error: Token missing or expired in request headers.");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Find the local user profile via the strict token userId pointer
    const admin = await prisma.user.findUnique({
      where: { clerkId: userId }, 
      include: { stations: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin profile not found" }, { status: 404 });
    }

    // 3. Handle a brand new admin with zero stations safely 
    if (admin.stations.length === 0) {
      return NextResponse.json({ 
        bookings: [], 
        total: 0, 
        historyBookings: [], 
        totalHistory: 0 
      });
    }

    // Collect all unique station IDs owned strictly by this authenticated administrator
    const stationIds = admin.stations.map((s) => s.id);

    // ⌚ Capture the exact current timestamp right now
    const now = new Date();

    // 🎯 STEP 1: AUTOMATIC EXPIRY UPGRADE
    await prisma.booking.updateMany({
      where: {
        stationId: { in: stationIds },
        status: "PENDING",
        slotTime: { lt: now } 
      },
      data: {
        status: "COMPLETED" 
      }
    });

    // 🎯 STEP 2: DEFINE FILTER MASKS FOR BOTH TABLES
    const activeQueryFilter = {
      stationId: { in: stationIds },
      status: "PENDING",
    };

    const historyQueryFilter = {
      stationId: { in: stationIds },
      status: {
        in: ["COMPLETED", "CANCELLED", "CANCELLED_BY_USER", "CANCELLED_BY_ADMIN", "CANCELLED_BY_DRIVER"]
      }
    };

    // 4. Run a concurrent database transaction pipeline
    const [activeBookings, totalActive, historyBookings, totalHistory] = await prisma.$transaction([
      // 🟢 Main Active Queue Query
      prisma.booking.findMany({
        where: activeQueryFilter,
        include: { user: true, station: true },
        orderBy: { slotTime: "asc" }, 
        skip: activeSkip,             
        take: limit, 
      }),
      // Count for Active Pagination
      prisma.booking.count({
        where: activeQueryFilter,
      }),
      // 📜 Full Station History Log Query
      prisma.booking.findMany({
        where: historyQueryFilter,
        include: { user: true, station: true },
        orderBy: { slotTime: "desc" }, 
        skip: historySkip,            
        take: historyLimit,           
      }),
      // Count for History Pagination
      prisma.booking.count({
        where: historyQueryFilter,
      })
    ]);

    // 5. Send both data blocks to your frontend layout components cleanly
    return NextResponse.json({ 
      bookings: activeBookings || [], 
      total: totalActive || 0,
      historyBookings: historyBookings || [],
      totalHistory: totalHistory || 0
    }, { status: 200 });

  } catch (err) {
    console.error("Dashboard calculation backend leak crash:", err);
    return NextResponse.json({ error: "Internal Server Database Error" }, { status: 500 });
  }
}