import { LucideIcon } from "lucide-react";

export interface IStreakCardProps {
  icon: string
  title: string
  color: string
  valueText: string
  progress: number
  progressDescription: string
}

export interface IDescription {
  text: string
  textHighlight?: string | ''
}

export interface IWelcomeContentProps {
  hightlightColor: string
  Icon: LucideIcon | string
  title: string
  titleHighlight: string
  badge: string
  badge2: string
  descriptions: IDescription[]
  background: string
}

export interface IStatsOverview {
  title: string;
  value: string;
  change: string;
  Icon: LucideIcon;
  color: string;
}


export interface IWelcomeSectionProps {
  welcomeContent: IWelcomeContentProps
  statsOverview: IStatsOverview[]
  streakCard?: IStreakCardProps
}