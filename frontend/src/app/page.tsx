import { Calculator } from "@/components/Calculator";
import { Onboarding } from "@/components/Onboarding";
import { Mascot } from "@/components/Mascot";
import { StatsModal } from "@/components/StatsModal";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-background">
      <Onboarding />
      {/* Mascot will sit above the calculator. We pass factActive=false initially. Calculator internal state manages actual active fact, so in a real refactor, the state should be lifted. For MVP, we can keep it simple. */}
      <Mascot factActive={false} />
      <Calculator />
    </main>
  );
}
