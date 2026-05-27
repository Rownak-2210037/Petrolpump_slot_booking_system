import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    const station = await prisma.station.findFirst();

    // 🛠️ Prepare clean data fields first
    const userData: any = {
      clerkId: clerkUser.id,
      name: clerkUser.fullName || "User",
      email: clerkUser.emailAddresses[0].emailAddress,
      role: "DRIVER",
    };

    // 🛠️ Only attach the stations connection key if a station row is actively found!
    if (station) {
      userData.stations = {
        connect: { id: station.id },
      };
    }

    // Safely write the user to your Neon Cloud database
    user = await prisma.user.create({
      data: userData,
    });
  }

   // 📄 Inside app/api/sync-user/route.ts -> Replace the very last line with this:
  return new Response(JSON.stringify({ success: true, user }));
}