import { getPublicOrderTracking } from "@/services/api/server";
import { OrderTrackingView } from "@/views/OrderTracking";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}) {
  const { trackingCode } = await params;
  const initialOrder = await getPublicOrderTracking(trackingCode);

  return (
    <OrderTrackingView
      trackingCode={trackingCode}
      initialOrder={initialOrder}
    />
  );
}
