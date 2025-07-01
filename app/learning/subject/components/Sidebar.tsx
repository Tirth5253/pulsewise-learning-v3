"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, BookOpen, X } from "lucide-react"
import learningData from "../../../../data/learning-data.json"

interface Subject {
  id: string
  title: string
  description: string
  image: string
  category: string
  totalLessons: number
  color: string
}

interface SidebarProps {
  currentSubject: Subject
  allSubjects: Subject[]
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ currentSubject, allSubjects, className = "", isOpen = true, onClose }: SidebarProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set([currentSubject.id]))
  const [progress, setProgress] = useState<Record<string, Record<string, boolean>>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedProgress = localStorage.getItem("learning-progress")
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const subjectsWithLessons = useMemo(() => {
    return allSubjects.map((subject) => {
      const lessons = learningData.lessons.filter((l) => l.subjectId === subject.id)
      const subjectProgress = progress[subject.id] || {}
      const completedLessons = lessons.filter((lesson) => subjectProgress[lesson.id]).length

      return {
        ...subject,
        lessons: lessons.sort((a, b) => a.order - b.order),
        completedLessons,
        totalLessons: lessons.length,
      }
    })
  }, [allSubjects, progress])

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  if (!mounted) {
    return (
      <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r border-gray-200 overflow-y-auto z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${className}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/learning" className="block">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Learning Hub</h2>
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-2xl"
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <nav className="space-y-3">
            {subjectsWithLessons.map((subject, index) => {
              const isExpanded = expandedSubjects.has(subject.id)
              const iconColors = [
                "from-blue-500 to-blue-600",
                "from-purple-500 to-purple-600",
                "from-pink-500 to-pink-600",
                "from-indigo-500 to-indigo-600",
              ]
              const iconColor = iconColors[index % iconColors.length]

              return (
                <div key={subject.id} className="space-y-2">
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-colors ${
                      currentSubject.id === subject.id ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50 text-gray-700"
                    }`}
                    aria-expanded={isExpanded}
                    aria-label={`Toggle ${subject.title} lessons`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${iconColor} p-2 flex-shrink-0 flex items-center justify-center shadow-md`}
                      >
                        <BookOpen className="w-full h-full text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-base truncate">{subject.title}</div>
                        <div className="text-sm text-gray-500">
                          {subject.completedLessons}/{subject.totalLessons} completed
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-14 space-y-2">
                      {subject.lessons.map((lesson) => {
                        const isCompleted = progress[subject.id]?.[lesson.id]

                        return (
                          <Link
                            key={lesson.id}
                            href={`/learning/lesson/${lesson.id}`}
                            className={`block p-3 rounded-xl text-base transition-colors ${
                              isCompleted
                                ? "text-gray-700 hover:bg-gray-50 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                            onClick={onClose}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{lesson.title}</span>
                              {isCompleted && <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
