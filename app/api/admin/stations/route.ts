import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Clerk সেশন টোকেন রিড করা
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, address, capacity } = await req.json();

    // 2. Neon DB থেকে অ্যাডমিন ইউজার রো খুঁজে বের করা
    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. সিকিউরিটি চেক
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // 4. 🎯 ফিক্সড: আপনার স্কিমার আসল নাম 'admins' ব্যবহার করে কানেক্ট করা হলো
    const station = await prisma.station.create({
      data: {
        name,
        address,
        capacity: parseInt(capacity) || 0,
        // 🔗 'users' এর বদলে 'admins' দিয়ে অ্যাডমিন আইডির সাথে কানেক্ট করা হলো
        admins: { 
          connect: { id: user.id } 
        }, 
      },
      include: { admins: true }, // 🔗 এখানেও 'admins' হবে
    });

    console.log("🚀 Station created successfully and linked to admin:", station);
    return NextResponse.json({ success: true, station });

  } catch (err) {
    console.error("Critical station creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth(); 
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ইউজারের সাথে তার নিজস্ব স্টেশনগুলো একবারে লোড করা
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
    
    // 🎯 লজিক এবং রিলেশন ফিল্ড ফিক্স
    if (dbUser.role === "SUPER_ADMIN") {
      stations = await prisma.station.findMany({
        include: { admins: true }, // 🔗 ফিক্সড: এখানেও 'users' এর বদলে 'admins' হবে
        orderBy: { createdAt: "desc" },
      });
    } else {
      // ADMIN হলে শুধুমাত্র তার নিজস্ব স্টেশনগুলো শো করবে
      stations = dbUser.stations || [];
    }

    return NextResponse.json({ stations });

  } catch (err) {
    console.error("Error running station GET collector:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}