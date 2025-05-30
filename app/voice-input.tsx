"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Extend the Window interface to include SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

// If SpeechRecognition is not defined, define a minimal type for it
type SpeechRecognition = any
import { Mic, MicOff, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Task } from "../types/task"

interface VoiceInputProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void
  onVoiceTaskCreated: () => void
}

export function VoiceInput({ isOpen, onClose, onAddTask, onVoiceTaskCreated }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            const confidence = event.results[i][0].confidence

            if (event.results[i].isFinal) {
              finalTranscript += transcript
              setConfidence(confidence)
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setTranscript("")
      setConfidence(0)
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleConfirm = () => {
    if (!transcript.trim()) return

    // Simple parsing - you could make this more sophisticated
    const taskTitle = transcript.trim()

    onAddTask({
      title: taskTitle,
      description: "Created with voice input",
      category: "personal",
      priority: "normal",
      completed: false,
      xpReward: 20, // Bonus XP for voice input
    })

    onVoiceTaskCreated()
    setTranscript("")
    onClose()
  }

  const handleClose = () => {
    stopListening()
    setTranscript("")
    onClose()
  }

  if (!isSupported) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <Card className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Voice Input Not Supported</h3>
              <p className="text-sm text-gray-600 mb-4">Your browser doesn't support speech recognition.</p>
              <Button onClick={handleClose}>Close</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
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
                  🎤 Voice Input
                </h2>
                <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center space-y-6">
                {/* Microphone Button */}
                <motion.div
                  animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ repeat: isListening ? Number.POSITIVE_INFINITY : 0, duration: 1 }}
                >
                  <Button
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    className={`h-20 w-20 rounded-full ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    }`}
                  >
                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </Button>
                </motion.div>

                {/* Status */}
                <div>
                  {isListening ? (
                    <div className="space-y-2">
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        🔴 Listening...
                      </Badge>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                        className="flex justify-center space-x-1"
                      >
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 20, 4] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 0.8,
                              delay: i * 0.1,
                            }}
                            className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                          />
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <Badge variant="outline">Tap to start speaking</Badge>
                  )}
                </div>

                {/* Transcript */}
                {transcript && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium mb-1">Recognized:</p>
                      <p className="text-lg">{transcript}</p>
                      {confidence > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          {Math.round(confidence * 100)}% confident
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setTranscript("")} className="flex-1">
                        Clear
                      </Button>
                      <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  </motion.div>
                )}

                <p className="text-xs text-gray-500">
                  Speak clearly and describe your task. You'll get +20 XP bonus for voice input!
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
