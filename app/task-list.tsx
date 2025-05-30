"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Trash2, Calendar, Flag, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "../page"

interface TaskListProps {
  tasks: Task[]
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Flag className="h-3 w-3 text-red-500" />
      case "important":
        return <Flag className="h-3 w-3 text-orange-500" />
      default:
        return <Flag className="h-3 w-3 text-green-500" />
    }
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "work":
        return "💼"
      case "health":
        return "🏃"
      case "bonus":
        return "🎯"
      default:
        return "👤"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500"
      case "important":
        return "border-l-orange-500"
      default:
        return "border-l-green-500"
    }
  }

  const TaskItem = ({ task, index }: { task: Task; index: number }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card
        className={`p-4 border-l-4 ${getPriorityColor(task.priority)} ${
          task.completed ? "opacity-60 bg-gray-50 dark:bg-gray-800/50" : "hover:shadow-lg transition-all duration-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <motion.div whileTap={{ scale: 0.9 }} className="mt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onComplete(task.id)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
            />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getCategoryEmoji(task.category)}</span>
              <h3 className={`font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}>{task.title}</h3>
              {task.category === "bonus" && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">BONUS</Badge>
              )}
            </div>

            {task.description && (
              <p className={`text-sm mb-2 ${task.completed ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs">
              {getPriorityIcon(task.priority)}

              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />+{task.xpReward} XP
              </Badge>

              {task.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </Badge>
              )}

              <Badge variant="outline" className="text-xs capitalize">
                {task.category}
              </Badge>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-bold">Active Tasks</h2>
            <Badge variant="secondary">{pendingTasks.length}</Badge>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingTasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <Check className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-bold">Completed</h2>
            <Badge variant="secondary">{completedTasks.length}</Badge>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {completedTasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold mb-2">Ready to level up?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Create your first task and start earning XP!</p>
          <div className="text-sm text-gray-500">Tip: Use the voice input for bonus XP! 🎤</div>
        </motion.div>
      )}
    </div>
  )
}
