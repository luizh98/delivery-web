import { notFound } from "next/navigation";
import { HomeView } from "@/views/Home";

export const metadata = { title: "Cardápio" };

export default async function TableMenu({ searchParams }: { searchParams: Promise<{ mesa?: string }> }) {
  const { mesa } = await searchParams;
  if (!mesa) notFound();
  return <HomeView tableToken={mesa} />;
}
