import { HomeView } from "@/views/Home";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ mesa?: string }> }) {
  const { mesa } = await searchParams;
  return <HomeView tableToken={mesa} />;
}
