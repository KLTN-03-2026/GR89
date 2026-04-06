import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react';

interface SearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Search({ value, onChange }: SearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Tìm kiếm bộ từ vựng..."
        value={value}
        onChange={(e) => onChange(e)}
        className="pl-10 w-80"
      />
    </div>
  )
}
