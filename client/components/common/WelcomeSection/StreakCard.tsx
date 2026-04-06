import { Progress } from "@/components/ui/progress";
import { IStreakCardProps } from "../../../types/welcomeSection";

export default function StreakCard({ icon, title, value, valueText, progress, progressDescription, color }: IStreakCardProps) {
  return (
    <div className={`hidden xl:flex flex-col gap-6 items-center justify-center bg-gradient-to-r ${color} text-md text-white border-0 backdrop-blur-sm font-medium p-8 px-10 shadow-md rounded-md h-full`}>
      <span className="text-8xl">{icon}</span>
      <span className="text-5xl font-bold">{valueText}</span>
      <span className="text-xl">{title}</span>
      <Progress value={value / progress * 100} className="w-full !bg-white" />
      <span className="text-sm">{progressDescription}</span>
    </div>
  )
}
