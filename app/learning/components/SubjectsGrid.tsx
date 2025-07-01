"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface Subject {
  id: string
  title: string
  description: string
  image: string
  category: string
  totalLessons: number
  color: string
}

interface SubjectsGridProps {
  subjects: Subject[]
}

export default function SubjectsGrid({ subjects }: SubjectsGridProps) {
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load progress from localStorage
    const savedProgress = localStorage.getItem("learning-progress")
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const getSubjectProgress = useCallback(
    (subjectId: string, totalLessons: number) => {
      const subjectProgress = progress[subjectId] || {}
      const completedLessons = Object.values(subjectProgress).filter(Boolean).length
      return Math.round((completedLessons / totalLessons) * 100)
    },
    [progress],
  )

  const subjectsWithProgress = useMemo(() => {
    return subjects.map((subject) => ({
      ...subject,
      progressPercent: getSubjectProgress(subject.id, subject.totalLessons),
    }))
  }, [subjects, getSubjectProgress])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="h-64 bg-gray-200 rounded-3xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Darker color variants for better visibility
  const iconColors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {subjectsWithProgress.map((subject, index) => {
        const iconColor = iconColors[index % iconColors.length]

        return (
          <Link key={subject.id} href={`/learning/subject/${subject.id}`} className="group block">
            <Card className="h-full bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg hover:shadow-xl rounded-3xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                  {/* Subject Image */}
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${iconColor} p-4 md:p-5 group-hover:scale-110 transition-transform duration-300 shadow-lg flex items-center justify-center`}
                  >
                    <Image
                      src={subject.image || "/placeholder.svg"}
                      alt={`${subject.title} icon`}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain filter brightness-0 invert"
                    />
                  </div>

                  {/* Subject Info */}
                  <div className="space-y-3">
                    <span className="inline-block px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                      {subject.category}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors leading-tight">
                      {subject.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-2">
                      {subject.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{subject.totalLessons} lessons</span>
                      <span className="text-gray-700 font-medium">{subject.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${subject.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
