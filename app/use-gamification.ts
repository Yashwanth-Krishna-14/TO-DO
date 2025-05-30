"use client"

import type { UserStats, Task } from "../page"

export function useGameification() {
  const calculateLevel = (xp: number): number => {
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  const getXPForNextLevel = (level: number): number => {
    return level * level * 100
  }

  const updateStreak = (lastCompletionDate?: string): number => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (!lastCompletionDate) {
      return 1 // First completion
    }

    if (lastCompletionDate === yesterday) {
      return 1 // Continue streak
    } else if (lastCompletionDate === today) {
      return 1 // Already completed today
    } else {
      return 1 // Reset streak
    }
  }

  const checkAchievements = (userStats: UserStats, tasks: Task[]): string[] => {
    const newAchievements: string[] = []

    // First task
    if (userStats.tasksCompleted >= 1 && !userStats.achievements.includes("first_task")) {
      newAchievements.push("first_task")
    }

    // Task slayer (10 tasks in a day)
    const today = new Date().toDateString()
    const tasksCompletedToday = tasks.filter(
      (task) => task.completed && new Date(task.createdAt).toDateString() === today,
    ).length

    if (tasksCompletedToday >= 10 && !userStats.achievements.includes("task_slayer")) {
      newAchievements.push("task_slayer")
    }

    // Voice master
    if (userStats.voiceTasksCreated >= 10 && !userStats.achievements.includes("voice_master")) {
      newAchievements.push("voice_master")
    }

    // Streak warrior
    if (userStats.streak >= 7 && !userStats.achievements.includes("streak_warrior")) {
      newAchievements.push("streak_warrior")
    }

    // Level achievements
    if (userStats.level >= 5 && !userStats.achievements.includes("level_5")) {
      newAchievements.push("level_5")
    }

    if (userStats.level >= 10 && !userStats.achievements.includes("level_10")) {
      newAchievements.push("level_10")
    }

    // Century club
    if (userStats.tasksCompleted >= 100 && !userStats.achievements.includes("century_club")) {
      newAchievements.push("century_club")
    }

    return newAchievements
  }

  const getEncouragingMessage = (): string => {
    const messages = [
      "Boom! Another one down! 💥",
      "You're unstoppable! 🚀",
      "Task crushed! Keep going! ⚡",
      "Productivity level: LEGENDARY! 🏆",
      "You're on fire! 🔥",
      "Mission accomplished! 🎯",
      "Level up your life! ⭐",
      "Crushing it! 💪",
      "Task master in action! 🎮",
      "Victory achieved! 🎉",
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  return {
    calculateLevel,
    getXPForNextLevel,
    updateStreak,
    checkAchievements,
    getEncouragingMessage,
  }
}
