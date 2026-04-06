import StatsOverview from "./StatsOverview";
import StreakCard from "./StreakCard";
import WelcomeContent from "./WelcomeContent";
import { IWelcomeSectionProps } from "@/types";

export function WelcomeSection({ welcomeContent, statsOverview, streakCard }: IWelcomeSectionProps) {

  return (
    <section className="mb-5">
      <div className={`flex items-center gap-4 justify-between w-full border-2xl bg-gradient-to-br ${welcomeContent.background} rounded-2xl px-8 py-12`}>
        <WelcomeContent
          {...welcomeContent}
        />
        <StreakCard
          {...streakCard}
        />
      </div>

      <StatsOverview statsOverview={statsOverview} />
    </section>
  )
}
