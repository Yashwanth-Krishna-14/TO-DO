"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StreakTrackerProps {
  streak: number
}

export function StreakTracker({ streak }: StreakTrackerProps) {
  const days = ["S", "M", "T", "W", "T", "F", "S"]
  const today = new Date().getDay()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <Card className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6" />
            <h3 className="text-xl font-bold">Daily Streak</h3>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{streak}</div>
            <div className="text-sm opacity-90">days</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {days.map((day, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= today && streak > 0 ? "bg-white text-orange-500" : "bg-white/20 text-white/70"
              }`}
            >
              {day}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 text-center text-sm opacity-90">
          {streak === 0
            ? "Complete a task today to start your streak!"
            : streak === 1
              ? "Great start! Keep it going tomorrow!"
              : `Amazing! You're on fire! 🔥`}
        </div>
      </Card>
    </motion.div>
  )
}
