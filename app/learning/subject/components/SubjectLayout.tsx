"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, CheckCircle, Menu, ChevronLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Sidebar from "./Sidebar"

interface Subject {
  id: string
  title: string
  description: string
  image: string
  category: string
  totalLessons: number
  color: string
}

interface Lesson {
  id: string
  subjectId: string
  title: string
  description: string
  order: number
  totalCards: number
}

interface SubjectLayoutProps {
  subject: Subject
  lessons: Lesson[]
  allSubjects: Subject[]
}

export default function SubjectLayout({ subject, lessons, allSubjects }: SubjectLayoutProps) {
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const savedProgress = localStorage.getItem("learning-progress")
    if (savedProgress) {
      const allProgress = JSON.parse(savedProgress)
      setProgress(allProgress[subject.id] || {})
    }
  }, [subject.id])

  const completedLessons = Object.values(progress).filter(Boolean).length
  const progressPercent = Math.round((completedLessons / lessons.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          currentSubject={subject}
          allSubjects={allSubjects}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          className="lg:block"
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-80">
          {/* Back Button - Fixed Position */}
          <div className="fixed top-6 left-6 lg:left-[22rem] z-20">
            <Link
              href="/learning"
              className="inline-flex items-center px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-600 hover:text-gray-700 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Back to learning hub"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Link>
          </div>

          <div className="container mx-auto px-4 py-6 md:py-8 pt-20">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1" />
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 hover:bg-white/20 rounded-2xl"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-0">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-4 md:p-5 shadow-lg flex items-center justify-center">
                    <BookOpen className="w-full h-full text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full mb-3">
                      {subject.category}
                    </span>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                      {subject.title}
                    </h1>
                    <p className="text-gray-600 mt-2 text-base md:text-lg">{subject.description}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-600">
                      {completedLessons} of {lessons.length} lessons completed
                    </span>
                    <span className="text-gray-700 font-medium">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson) => {
                  const isCompleted = progress[lesson.id]

                  return (
                    <Link key={lesson.id} href={`/learning/lesson/${lesson.id}`} className="group block">
                      <Card className="h-full bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-3xl">
                        <CardContent className="p-6 md:p-8">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <span className="text-sm font-medium text-gray-500">Lesson {lesson.order}</span>
                                {isCompleted && (
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors mb-3 leading-tight">
                                {lesson.title}
                              </h3>
                              <p className="text-base text-gray-600 leading-relaxed mb-6 line-clamp-2">
                                {lesson.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{lesson.totalCards} cards</span>
                            <span
                              className={`px-4 py-2 rounded-full ${
                                isCompleted ? "bg-green-100 text-green-700 font-medium" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isCompleted ? "Completed" : "Start"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
