import { motion } from 'framer-motion'
import { Sparkles, Trophy } from 'lucide-react'

interface RewardNodeProps {
  delay: number
}

export default function RewardNode({ delay }: RewardNodeProps) {
  return (
    <>
      <div className="flex justify-center pt-2">
        <div className="w-1 h-12 bg-gray-300 rounded-full" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -10, 0] }}
        transition={{ delay, type: "spring", stiffness: 200, y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
        className="flex flex-col items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.15, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-28 h-28 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer ring-4 ring-white"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(234, 179, 8, 0.5))' }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
          <Trophy className="w-12 h-12 text-white relative z-10" />
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </motion.div>
        </motion.button>
        <div className="text-center">
          <p className="text-base font-bold text-gray-800 mb-1">Phần thưởng</p>
          <p className="text-sm text-gray-600">Hoàn thành tất cả</p>
        </div>
      </motion.div>
    </>
  )
}
