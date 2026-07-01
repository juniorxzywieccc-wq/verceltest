import dynamic from "next/dynamic";

const HistoriaClient = dynamic(() => import("@/components/pages/HistoriaClient"), {
  ssr: false,
});

export default function HistoriaPage() {
  return <HistoriaClient />;
}
