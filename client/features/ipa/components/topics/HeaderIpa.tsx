import { Layers } from "lucide-react";

export function HeaderIpa() {
  return (
    <header className="my-6">
      <div className="flex items-center gap-2">
        <span className="p-2 bg-yellow-400 rounded-md text-white"><Layers /></span>
        <h1 className="text-3xl font-semibold">Bảng phiên âm IPA</h1>
      </div>
      <p className="text-gray-400">Bảng phiên âm quốc tế đầy đủ cho tiếng Anh</p>
    </header>
  )
}
