"use client"

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

const ProgressBar = ({ current, total, className = "" }: ProgressBarProps) => {
  const progress = Math.round((current / total) * 100)

  return (
    <div className={`w-full max-w-md md:max-w-lg bg-gray-200 rounded-full h-3 shadow-inner ${className}`}>
      <div
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ProgressBar
