import dynamic from "next/dynamic";

const MathExplorer = dynamic(() => import("@/components/MathExplorer"), {
  ssr: !!false,
});

export default function Home() {
  return <MathExplorer />;
}
