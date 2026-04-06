import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  }
}

export function PageHeader({
  title,
  subtitle,
  primaryAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {subtitle}
        </p>
      </div>

      {
        primaryAction && (
          <div>
            <Button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 bg-black hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              <span>{primaryAction.label}</span>
            </Button>
          </div>
        )
      }
    </div>
  );
}