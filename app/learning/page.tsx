import type { Metadata } from "next"
import SubjectsGrid from "./components/SubjectsGrid"
import learningData from "../../data/learning-data.json"

export const metadata: Metadata = {
  title: "Learning Hub - Master Design & Development Skills",
  description:
    "Explore comprehensive courses in UX Design, UI Patterns, User Research, and more. Interactive learning with progress tracking.",
  keywords: "UX design, UI patterns, user research, web accessibility, design systems, learning platform",
}

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Learning Hub</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Master design and development skills with our interactive learning platform. Track your progress and learn
            at your own pace.
          </p>
        </header>

        <SubjectsGrid subjects={learningData.subjects} />
      </div>
    </div>
  )
}
