import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Crown } from "lucide-react";

interface props {
  _id: string
  sound: string
  soundType: 'vowel' | 'diphthong' | 'consonant'
  examples: {
    word: string
    phonetic: string
    vietnamese: string
  }[]
  progress: number
  isVipRequired?: boolean
}

export default function CardIpa({ sound, soundType, examples, progress, _id, isVipRequired }: props) {
  const soundTypeColor = {
    vowel: 'from-red-500 to-red-400',
    diphthong: 'from-green-500 to-green-400',
    consonant: 'from-blue-500 to-blue-400',
  }

  const borderTypeColor = {
    vowel: 'border-red-500/40',
    diphthong: 'border-green-500/40',
    consonant: 'border-blue-500/40',
  }

  return (
    <Link
      href={`/study/ipa/learn/${_id}`}
      className={`hover:scale-[1.02] cursor-pointer w-full min-h-[100px] sm:min-h-[120px] flex flex-col justify-center items-center p-1 sm:p-2 lg:p-3 rounded-xl border border-border/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:shadow-md transition-all duration-300 relative overflow-visible ${borderTypeColor[soundType]}`}
    >
      {isVipRequired && (
        <div className="absolute -top-1 -right-1 z-30 bg-yellow-500 rounded-full p-0.5 sm:p-1 shadow-lg border-2 border-white">
          <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
        </div>
      )}
      <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${soundTypeColor[soundType]} flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2`}>
        {sound}
      </div>
      <p className="text-xs sm:text-sm text-center w-full truncate">{examples[0].word}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-0.5 w-full truncate">{examples[0].phonetic}</p>

      <div className="w-full relative mt-1.5 sm:mt-2">
        <Progress value={progress} className="h-3 sm:h-4" />
        <span className="absolute top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2 text-[9px] sm:text-[10px] font-medium text-muted-foreground">
          {progress | 0} %
        </span>
      </div>
    </Link>
  )
}
