import { prisma } from "@/lib/prisma";
import { HomePageClient } from "@/components/HomePageClient";
import { Butterflies } from "@/components/Butterflies";

export default async function Home() {
  const pages = await prisma.page.findMany({
    include: {
      media: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Butterflies />
      <HomePageClient pages={pages} />
    </main>
  );
}
