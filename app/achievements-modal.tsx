"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Star, Flame, Zap, Mic, Target, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { UserStats } from "../page"

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
  achievements: string[]
  userStats: UserStats
}

const ACHIEVEMENT_DEFINITIONS = {
  first_task: {
    title: "Getting Started",
    description: "Complete your first task",
    icon: Star,
    color: "from-blue-500 to-cyan-500",
  },
  task_slayer: {
    title: "Task Slayer",
    description: "Complete 10 tasks in a single day",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
  },
  early_bird: {
    title: "Early Bird",
    description: "Complete a task before 9 AM",
    icon: Clock,
    color: "from-orange-500 to-yellow-500",
  },
  voice_master: {
    title: "Voice Master",
    description: "Create 10 tasks using voice input",
    icon: Mic,
    color: "from-green-500 to-emerald-500",
  },
  streak_warrior: {
    title: "Streak Warrior",
    description: "Maintain a 7-day streak",
    icon: Flame,
    color: "from-red-500 to-orange-500",
  },
  level_5: {
    title: "Rising Star",
    description: "Reach level 5",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500",
  },
  level_10: {
    title: "Productivity Master",
    description: "Reach level 10",
    icon: Trophy,
    color: "from-purple-500 to-indigo-500",
  },
  century_club: {
    title: "Century Club",
    description: "Complete 100 tasks",
    icon: Target,
    color: "from-pink-500 to-rose-500",
  },
}

export function AchievementsModal({ isOpen, onClose, achievements, userStats }: AchievementsModalProps) {
  const allAchievements = Object.keys(ACHIEVEMENT_DEFINITIONS)
  const unlockedCount = achievements.length
  const totalCount = allAchievements.length
  const completionPercentage = (unlockedCount / totalCount) * 100

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-2xl">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🏆 Achievements
                  </h2>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {unlockedCount}/{totalCount}
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allAchievements.map((achievementId) => {
                    const achievement = ACHIEVEMENT_DEFINITIONS[achievementId as keyof typeof ACHIEVEMENT_DEFINITIONS]
                    const isUnlocked = achievements.includes(achievementId)
                    const Icon = achievement.icon

                    return (
                      <motion.div
                        key={achievementId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: allAchievements.indexOf(achievementId) * 0.1 }}
                      >
                        <Card
                          className={`p-4 transition-all duration-200 ${
                            isUnlocked
                              ? "border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                              : "opacity-50 grayscale"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full bg-gradient-to-r ${achievement.color} ${
                                isUnlocked ? "text-white" : "text-gray-400"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{achievement.title}</h3>
                                {isUnlocked && (
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                                    ✓ Unlocked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {unlockedCount === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold mb-2">Start Your Journey!</h3>
                    <p className="text-gray-600 dark:text-gray-300">Complete tasks to unlock your first achievement</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{userStats.level}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Level</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{userStats.tasksCompleted}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Tasks Done</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
