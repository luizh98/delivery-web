import { redirect } from "next/navigation";
import { tableMenuPath } from "@/utils/productAvailability";

type TableMenuPageProps = { params: Promise<{ token: string }> };

export default async function TableMenuPage({ params }: TableMenuPageProps) {
  const { token } = await params;
  redirect(tableMenuPath(token));
}
