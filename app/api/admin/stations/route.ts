import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) 
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { name, address, capacity } = await req.json();

    // Find admin user in DB
    let user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) 
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    

    const station = await prisma.station.create({
  data: {
    name,
    address,
    capacity,
    admins: { connect: { id: user.id } ,
    
  }, // link admin

  },
    include: { admins: true },
});
console.log("Station created with admins:", station);



    return NextResponse.json({ success: true, station });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) 
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ 
    where: { clerkId: clerkUser.id },
    include: { stations: true } 
  });

  if (!dbUser) 
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (dbUser.role !== "ADMIN" )
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

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
}
