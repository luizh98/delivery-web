import { getPublicPromotionCombo } from "@/services/api/server";
import { PromotionComboView } from "@/views/PromotionCombo";

export const dynamic = "force-dynamic";

export default async function PromotionComboPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const combo = await getPublicPromotionCombo(code);

  return <PromotionComboView combo={combo} />;
}
