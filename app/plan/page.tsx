import dynamic from "next/dynamic";

const PlanClient = dynamic(() => import("@/components/pages/PlanClient"), {
  ssr: false,
});

export default function PlanPage() {
  return <PlanClient />;
}
