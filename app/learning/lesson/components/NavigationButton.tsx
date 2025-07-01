"use client"

import type React from "react"

interface NavigationButtonProps {
  onClick: () => void
  disabled?: boolean
  direction: "left" | "right"
  icon: React.ReactNode
  ariaLabel: string
  className?: string
}

const NavigationButton = ({
  onClick,
  disabled = false,
  direction,
  icon,
  ariaLabel,
  className = "",
}: NavigationButtonProps) => {
  const hoverTransform = direction === "left" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group w-14 h-14 md:w-16 md:h-16 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-gray-700 shadow-md ${className}`}
      aria-label={ariaLabel}
      style={{ pointerEvents: disabled ? "none" : "auto" }}
    >
      <div className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 ${hoverTransform}`}>{icon}</div>
    </button>
  )
}

export default NavigationButton
