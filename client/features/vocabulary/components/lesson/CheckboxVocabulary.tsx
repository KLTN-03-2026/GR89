import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

interface Props {
  url: string
  word: string
  phonetic: string
  vietnamese: string
  handleSelect: (word: string) => void
  checked: boolean
}

export default function CheckboxVocabulary({ url, word, phonetic, vietnamese, handleSelect, checked }: Props) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={url}
            alt="Ảnh"
            width={100}
            height={100}
            className="h-full aspect-square object-cover rounded-md"
          />
          <div>
            <CardTitle>{word}</CardTitle>
            <CardDescription>{phonetic}</CardDescription>
            <CardDescription>{vietnamese}</CardDescription>
          </div>
        </div>

        <Checkbox checked={checked} onCheckedChange={() => handleSelect(word)} />
      </CardHeader>
    </Card>
  )
}

