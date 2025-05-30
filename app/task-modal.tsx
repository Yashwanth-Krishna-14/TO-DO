"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { Task } from "../page"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void
}

export function TaskModal({ isOpen, onClose, onAddTask }: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"work" | "personal" | "health">("personal")
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal")
  const [dueDate, setDueDate] = useState("")

  const [isListeningTitle, setIsListeningTitle] = useState(false)
  const [isListeningDescription, setIsListeningDescription] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsVoiceSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript

          if (isListeningTitle) {
            setTitle(transcript)
            setIsListeningTitle(false)
          } else if (isListeningDescription) {
            setDescription(transcript)
            setIsListeningDescription(false)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListeningTitle(false)
          setIsListeningDescription(false)
        }

        recognitionRef.current.onend = () => {
          setIsListeningTitle(false)
          setIsListeningDescription(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListeningTitle, isListeningDescription])

  const startVoiceInput = (field: "title" | "description") => {
    if (!recognitionRef.current || !isVoiceSupported) return

    // Stop any ongoing recognition
    recognitionRef.current.stop()

    if (field === "title") {
      setIsListeningTitle(true)
      setIsListeningDescription(false)
    } else {
      setIsListeningDescription(true)
      setIsListeningTitle(false)
    }

    setTimeout(() => {
      recognitionRef.current.start()
    }, 100)
  }

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListeningTitle(false)
    setIsListeningDescription(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    // Stop any ongoing voice input
    stopVoiceInput()

    const xpReward = priority === "urgent" ? 30 : priority === "important" ? 20 : 15

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      xpReward,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setCategory("personal")
    setPriority("normal")
    setDueDate("")
    onClose()
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "urgent":
        return "text-red-500"
      case "important":
        return "text-orange-500"
      default:
        return "text-green-500"
    }
  }

  const getCategoryIcon = (c: string) => {
    switch (c) {
      case "work":
        return "💼"
      case "health":
        return "🏃"
      default:
        return "👤"
    }
  }

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
            className="w-full max-w-md"
          >
            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ✨ Create New Task
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <div className="relative mt-1">
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="pr-12"
                      autoFocus
                    />
           
                  </div>
                  {isListeningTitle && (
                    <p className="text-xs text-purple-600 mt-1 animate-pulse">🎤 Listening for title...</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <div className="relative mt-1">
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add more details..."
                      className="resize-none pr-12"
                      rows={3}
                    />
      
                  </div>
                  {isListeningDescription && (
                    <p className="text-xs text-purple-600 mt-1 animate-pulse">🎤 Listening for description...</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">👤 Personal</SelectItem>
                        <SelectItem value="work">💼 Work</SelectItem>
                        <SelectItem value="health">🏃 Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">🟢 Normal (+15 XP)</SelectItem>
                        <SelectItem value="important">🟡 Important (+20 XP)</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent (+30 XP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!title.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Create Task
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
