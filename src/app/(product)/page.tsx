import { HomeView } from "@/views/Home";
import { redirect } from "next/navigation";
import { tableMenuPath } from "@/utils/productAvailability";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ mesa?: string }> }) {
  const { mesa } = await searchParams;
  if (mesa) redirect(tableMenuPath(mesa));
  return <HomeView />;
}
