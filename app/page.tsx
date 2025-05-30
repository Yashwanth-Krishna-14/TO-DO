"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Mic, Settings, Trophy, Flame, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TaskModal } from "./task-modal"
import { TaskList } from "./task-list"
import { VoiceInput } from "./voice-input"
import { AnimatedBackground } from "./animated-background"
import { AchievementsModal } from "./achievements-modal"
import { StreakTracker } from "./streak-tracker"
import { ConfettiEffect } from "./confetti-effect"
import { useLocalStorage } from "./use-local-storage"
import { useGameification } from "./use-gamification"
import { useTheme } from "./use-theme"

export interface Task {
  id: string
  title: string
  description: string
  category: "work" | "personal" | "health" | "bonus"
  priority: "normal" | "important" | "urgent"
  completed: boolean
  createdAt: Date
  dueDate?: Date
  xpReward: number
}

export interface UserStats {
  xp: number
  level: number
  streak: number
  lastCompletionDate?: string
  achievements: string[]
  tasksCompleted: number
  voiceTasksCreated: number
}

const BONUS_TASKS = [
  { title: "Take a 10-minute walk", description: "Get some fresh air and movement", xp: 25 },
  { title: "Drink 8 glasses of water", description: "Stay hydrated throughout the day", xp: 20 },
  { title: "Meditate for 5 minutes", description: "Practice mindfulness", xp: 30 },
  { title: "Call a friend or family member", description: "Connect with someone you care about", xp: 35 },
  { title: "Organize your workspace", description: "Clean and tidy your work area", xp: 25 },
]

export default function FuturisticTodoApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("futuristic-tasks", [])
  const [userStats, setUserStats] = useLocalStorage<UserStats>("user-stats", {
    xp: 0,
    level: 1,
    streak: 0,
    achievements: [],
    tasksCompleted: 0,
    voiceTasksCreated: 0,
  })

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState("")

  const { theme, toggleTheme } = useTheme()
  const { calculateLevel, getXPForNextLevel, checkAchievements, updateStreak, getEncouragingMessage } =
    useGameification()

  // Generate daily bonus task
  const [dailyBonusTask, setDailyBonusTask] = useLocalStorage<Task | null>("daily-bonus", null)

  useEffect(() => {
    const today = new Date().toDateString()
    const lastBonusDate = localStorage.getItem("last-bonus-date")

    if (lastBonusDate !== today) {
      const randomBonus = BONUS_TASKS[Math.floor(Math.random() * BONUS_TASKS.length)]
      const bonusTask: Task = {
        id: `bonus-${Date.now()}`,
        title: `🎯 ${randomBonus.title}`,
        description: randomBonus.description,
        category: "bonus",
        priority: "normal",
        completed: false,
        createdAt: new Date(),
        xpReward: randomBonus.xp,
      }
      setDailyBonusTask(bonusTask)
      localStorage.setItem("last-bonus-date", today)
    }
  }, [setDailyBonusTask])

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
      }
      setTasks((prev) => [...prev, newTask])
    },
    [setTasks],
  )

  const completeTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId) || dailyBonusTask
      if (!task || task.completed) return

      // Update task completion
      if (taskId === dailyBonusTask?.id) {
        setDailyBonusTask((prev) => (prev ? { ...prev, completed: true } : null))
      } else {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)))
      }

      // Update user stats
      const newXP = userStats.xp + task.xpReward
      const newLevel = calculateLevel(newXP)
      const leveledUp = newLevel > userStats.level
      const newStreak = updateStreak(userStats.lastCompletionDate)

      const updatedStats: UserStats = {
        ...userStats,
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        lastCompletionDate: new Date().toDateString(),
        tasksCompleted: userStats.tasksCompleted + 1,
      }

      // Check for new achievements
      const newAchievements = checkAchievements(updatedStats, tasks)
      updatedStats.achievements = [...new Set([...userStats.achievements, ...newAchievements])]

      setUserStats(updatedStats)

      // Show celebration
      setShowConfetti(true)
      setCelebrationMessage(getEncouragingMessage())
      setTimeout(() => {
        setShowConfetti(false)
        setCelebrationMessage("")
      }, 3000)

      // Show level up notification
      if (leveledUp) {
        setTimeout(() => {
          setCelebrationMessage(`🎉 LEVEL UP! You're now level ${newLevel}!`)
          setShowConfetti(true)
          setTimeout(() => {
            setShowConfetti(false)
            setCelebrationMessage("")
          }, 4000)
        }, 1000)
      }
    },
    [
      tasks,
      dailyBonusTask,
      userStats,
      setTasks,
      setDailyBonusTask,
      setUserStats,
      calculateLevel,
      updateStreak,
      checkAchievements,
      getEncouragingMessage,
    ],
  )

  const deleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    },
    [setTasks],
  )

  const handleVoiceTaskCreated = useCallback(() => {
    setUserStats((prev) => ({
      ...prev,
      voiceTasksCreated: prev.voiceTasksCreated + 1,
    }))
  }, [setUserStats])

  const allTasks = dailyBonusTask ? [dailyBonusTask, ...tasks] : tasks
  const completedToday = allTasks.filter(
    (task) => task.completed && new Date(task.createdAt).toDateString() === new Date().toDateString(),
  ).length

  const xpProgress =
    ((userStats.xp - getXPForNextLevel(userStats.level - 1)) /
      (getXPForNextLevel(userStats.level) - getXPForNextLevel(userStats.level - 1))) *
    100

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900"
      }`}
    >
      <AnimatedBackground theme={theme} />

      {/* Confetti Effect */}
      <AnimatePresence>{showConfetti && <ConfettiEffect />}</AnimatePresence>

      {/* Celebration Message */}
      <AnimatePresence>
        {celebrationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-2xl">
              <div className="text-lg font-bold text-center">{celebrationMessage}</div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ⚡ FutureTasks
            </h1>
            <p className="text-sm opacity-70 mt-1">Level up your productivity</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setIsAchievementsOpen(true)} className="relative">
              <Trophy className="h-4 w-4" />
              {userStats.achievements.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">{userStats.achievements.length}</Badge>
              )}
            </Button>

            <Button variant="outline" size="icon" onClick={toggleTheme}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Level & XP */}
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Level</span>
              <Star className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{userStats.level}</div>
            <div className="text-xs opacity-75">{userStats.xp} XP</div>
            <Progress value={xpProgress} className="mt-2 h-1" />
          </Card>

          {/* Streak */}
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Streak</span>
              <Flame className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{userStats.streak}</div>
            <div className="text-xs opacity-75">days</div>
          </Card>

          {/* Today's Tasks */}
          <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Today</span>
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{completedToday}</div>
            <div className="text-xs opacity-75">completed</div>
          </Card>

          {/* Total Tasks */}
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total</span>
              <Trophy className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{userStats.tasksCompleted}</div>
            <div className="text-xs opacity-75">tasks done</div>
          </Card>
        </motion.div>

        {/* Streak Tracker */}
        <StreakTracker streak={userStats.streak} />

        {/* Task List */}
        <TaskList tasks={allTasks} onComplete={completeTask} onDelete={deleteTask} />

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
       {/*    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              onClick={() => setIsVoiceModalOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
            >
              <Mic className="h-6 w-6" />
            </Button>
          </motion.div> */}

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              onClick={() => setIsTaskModalOpen(true)}
              className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </motion.div>
        </div>

        {/* Modals */}
        <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onAddTask={addTask} />

        <VoiceInput
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onAddTask={addTask}
          onVoiceTaskCreated={handleVoiceTaskCreated}
        />

        <AchievementsModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          achievements={userStats.achievements}
          userStats={userStats}
        />
      </div>
    </div>
  )
}
