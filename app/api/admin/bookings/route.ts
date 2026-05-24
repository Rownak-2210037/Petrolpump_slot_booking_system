import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// export async function GET() {
//   try {
//     const clerkUser = await currentUser();
//     if (!clerkUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

//     const admin = await prisma.user.findUnique({
//       where: { clerkId: clerkUser.id },
//       include: { stations: true },
//     });

//     if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

//     const stationIds = admin.stations.map((s) => s.id);
//     console.log("Admin stations:", stationIds);


//     const whereClause =
//       admin.role === "ADMIN" ? {} : { stationId: { in: stationIds } };

//     const bookings = await prisma.booking.findMany({
//       where: whereClause,
//       include: { user: true, station: true },
//       orderBy: { slotTime: "asc" },
//     });

//     return NextResponse.json({ bookings });
//   } catch (err) {
//     console.error("Error fetching bookings:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
  


    const clerkUser = await currentUser();
    if (!clerkUser)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const admin = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { stations: true },
    });

    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    if (admin.stations.length === 0)
      return NextResponse.json({ bookings: [], total: 0 });

    const stationIds = admin.stations.map((s) => s.id);

    // Total bookings for pagination
    const total = await prisma.booking.count({
      where: { stationId: { in: stationIds } },
    });

    

//     const bookings = await prisma.booking.findMany({
//   where: { stationId: { in: stationIds } },
//   include: { user: true, station: true },
//   orderBy: { slotTime: "desc" }, // latest slotTime first
//   skip,
//   take: limit,
// });

// First, just fetch booking IDs in correct order
console.log('Pagination params:', { page, limit, skip });

const bookingsRaw = await prisma.booking.findMany({
  where: { stationId: { in: stationIds } },
 
 

   skip,                       

take: limit,
orderBy: { slotTime: "desc" },

  select: { id: true },
});

// Then fetch full bookings including relations
const bookings = await prisma.booking.findMany({
  where: { id: { in: bookingsRaw.map(b => b.id) } },
  include: { user: true, station: true },
});

console.log(bookings.length, bookings.map(b => b.slotTime));
console.log('Fetched bookings:', bookings.length);



    //return NextResponse.json({ bookings, total });
    return NextResponse.json({ bookings: bookings || [], total: total || 0 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
