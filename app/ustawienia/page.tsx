import dynamic from "next/dynamic";

const UstawieniaClient = dynamic(() => import("@/components/pages/UstawieniaClient"), {
  ssr: false,
});

export default function UstawieniaPage() {
  return <UstawieniaClient />;
}
