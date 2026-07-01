import dynamic from "next/dynamic";

const TreningClient = dynamic(() => import("@/components/pages/TreningClient"), {
  ssr: false,
});

export default function TreningPage() {
  return <TreningClient />;
}
