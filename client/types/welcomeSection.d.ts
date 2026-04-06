import { LucideIcon } from "lucide-react";

export interface IStreakCardProps {
  icon: string
  title: string
  color: string
  value: number
  valueText: string
  progress: number
  progressDescription: string
}

export interface IDescription {
  text: string
  textHighlight?: string | ''
}

export interface IButton {
  type: 'outline' | 'default'
  text: string
  icon: LucideIcon
}

export interface IWelcomeContentProps {
  hightlightColor: string
  Icon: LucideIcon | string
  title: string
  titleHighlight: string
  badge: string
  badge2: string
  descriptions: IDescription[]
  buttons: IButton[]
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
  streakCard: IStreakCardProps
}