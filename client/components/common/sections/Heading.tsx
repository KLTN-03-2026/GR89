import { LucideIcon } from "lucide-react";

const colorMap: Record<string, {
  badge: string;
  text: string;
  icon: string;
}> = {
  primary: {
    badge: "bg-blue-100 text-blue-700",
    text: "text-blue-600",
    icon: "text-blue-500"
  },
  secondary: {
    badge: "bg-green-100 text-green-700",
    text: "text-green-600",
    icon: "text-green-500"
  },
  accent: {
    badge: "bg-purple-100 text-purple-700",
    text: "text-purple-600",
    icon: "text-purple-500"
  },
}

interface HeadingProps {
  title: string;
  description: string;
  headline: string;
  color: string;
  Icon: LucideIcon
}

export default function Heading({ title, headline, description, color, Icon }: HeadingProps) {
  const colorScheme = colorMap[color] || colorMap.primary

  return (
    <div className="text-center max-w-4xl mx-auto">
      <div className={`inline-flex items-center gap-2 px-4 py-2 ${colorScheme.badge} rounded-full font-medium text-sm`}>
        <Icon className={`w-4 h-4 ${colorScheme.icon}`} />
        <span>{title}</span>
      </div>
      <h2 className={`text-3xl md:text-4xl font-bold my-6 leading-tight ${colorScheme.text}`}>
        {headline}
      </h2>
      <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  )
}
