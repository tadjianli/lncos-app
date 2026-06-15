import { OrderTrackingScreen } from "@/components/profile/OrderTrackingScreen";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderTrackingScreen orderId={decodeURIComponent(orderId)} />;
}
