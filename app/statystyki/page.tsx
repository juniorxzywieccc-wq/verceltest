import dynamic from "next/dynamic";

const StatystykiClient = dynamic(() => import("@/components/pages/StatystykiClient"), {
  ssr: false,
});

export default function StatystykiPage() {
  return <StatystykiClient />;
}
