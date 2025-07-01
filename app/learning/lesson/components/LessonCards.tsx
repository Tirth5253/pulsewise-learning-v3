"use client"
import { useState, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowLeft, ChevronLeft, Menu } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Sidebar from "../../subject/components/Sidebar"
import SwipeableCard, { type SwipeableCardRef } from "./SwipeableCard"
import learningData from "../../../../data/learning-data.json"

interface Subject {
  id: string
  title: string
  color: string
}

interface Lesson {
  id: string
  subjectId: string
  title: string
  description: string
  totalCards: number
}

interface LessonCard {
  id: string
  lessonId: string
  question: string
  answer: string
  image: string
  order: number
}

interface LessonCardsProps {
  lesson: Lesson
  subject: Subject
  cards: LessonCard[]
}

export default function LessonCards({ lesson, subject, cards: initialCards }: LessonCardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const swipeableCardRef = useRef<SwipeableCardRef>(null)

  const allSubjects = learningData.subjects
  const sortedCards = useMemo(() => initialCards.sort((a, b) => a.order - b.order), [initialCards])

  const moveToNextCard = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setCurrentCardIndex((prev) => (prev + 1) % sortedCards.length)

    // Save progress
    const savedProgress = localStorage.getItem("learning-progress") || "{}"
    const allProgress = JSON.parse(savedProgress)
    if (!allProgress[subject.id]) {
      allProgress[subject.id] = {}
    }

    // Mark as completed when viewed all cards
    const viewedCards = currentCardIndex + 1
    if (viewedCards >= sortedCards.length) {
      allProgress[subject.id][lesson.id] = true
      localStorage.setItem("learning-progress", JSON.stringify(allProgress))
    }

    setTimeout(() => {
      setIsAnimating(false)
    }, 350) // Match the transition duration
  }, [isAnimating, currentCardIndex, sortedCards.length, subject.id, lesson.id])

  const moveToPrevCard = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setCurrentCardIndex((prev) => (prev - 1 + sortedCards.length) % sortedCards.length)

    setTimeout(() => {
      setIsAnimating(false)
    }, 350) // Match the transition duration
  }, [isAnimating, sortedCards.length])

  const handleNextWithSwipe = useCallback(() => {
    if (isAnimating) return
    swipeableCardRef.current?.triggerSwipe("right")
  }, [isAnimating])

  const handlePrevWithSwipe = useCallback(() => {
    if (isAnimating) return
    swipeableCardRef.current?.triggerSwipe("left")
  }, [isAnimating])

  const cardColors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-cyan-500 to-cyan-600",
  ]

  // Create deck of cards - current card + next 3 cards for stacking effect
  const deckCards = useMemo(() => {
    const deck = []
    for (let i = 0; i < Math.min(4, sortedCards.length); i++) {
      const cardIndex = (currentCardIndex + i) % sortedCards.length
      deck.push({
        ...sortedCards[cardIndex],
        deckIndex: i,
      })
    }
    return deck
  }, [currentCardIndex, sortedCards])

  const currentProgress = currentCardIndex + 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentSubject={allSubjects.find((s) => s.id === subject.id)!}
        allSubjects={allSubjects}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="lg:block"
      />

      {/* Main Content */}
      <div className="lg:ml-80 flex-1 flex flex-col overflow-hidden">
        {/* Back Button - Fixed Position */}
        <div className="fixed top-6 left-6 lg:left-[22rem] z-20">
          <Link
            href={`/learning/subject/${subject.id}`}
            className="inline-flex items-center px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-600 hover:text-gray-700 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label="Back to subject"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
        </div>

        {/* Progress Bar - Top */}
        <div className="relative z-10 pt-20 pb-6 px-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 hover:bg-white/20 rounded-2xl text-gray-700"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{lesson.title}</h1>
              <p className="text-base text-gray-600">
                {currentProgress} of {sortedCards.length}
              </p>
            </div>
            <div className="w-16" />
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md md:max-w-lg bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.round((currentProgress / sortedCards.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cards Container - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-6 pb-20 overflow-hidden">
          <div className="flex items-center space-x-6 md:space-x-12">
            {/* Previous Button */}
            <button
              onClick={handlePrevWithSwipe}
              disabled={isAnimating}
              className="group w-14 h-14 md:w-16 md:h-16 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-gray-700 shadow-md"
              aria-label="Previous card"
            >
              <ArrowLeft className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>

            {/* Card Deck - Ultra Smooth Glassy Cards */}
            <div className="relative w-80 h-[480px] sm:w-96 sm:h-[580px] md:w-[26rem] md:h-[34rem]">
              {deckCards.map((card) => {
                const cardColor = cardColors[card.order % cardColors.length]
                const isTopCard = card.deckIndex === 0

                // Ultra smooth stacking with perfect timing
                const stackOffsetY = card.deckIndex * 20
                const stackOffsetX = card.deckIndex * 6
                const scaleReduction = card.deckIndex * 0.02
                const opacityReduction = card.deckIndex * 0.15

                return (
                  <div
                    key={`${card.id}-${currentCardIndex}`}
                    className="absolute inset-0"
                    style={{
                      zIndex: 10 - card.deckIndex,
                      transform: `
                        translateY(${stackOffsetY}px) 
                        translateX(${stackOffsetX}px) 
                        scale(${1 - scaleReduction})
                      `,
                      opacity: Math.max(0.6, 1 - opacityReduction),
                      transition: isAnimating
                        ? "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)" // Ultra smooth for ALL cards during animation
                        : "none",
                      transformOrigin: "center top",
                    }}
                  >
                    {isTopCard ? (
                      <SwipeableCard
                        ref={swipeableCardRef}
                        onSwipeLeft={moveToPrevCard}
                        onSwipeRight={moveToNextCard}
                        onSwipeUp={moveToNextCard}
                        onSwipeDown={moveToNextCard}
                        className="w-full h-full"
                      >
                        {/* Ultra Glassy Top Card */}
                        <div className="w-full h-full relative">
                          {/* Subtle Aesthetic Shadows */}
                          <div
                            className="absolute inset-0 rounded-3xl transform translate-y-6 translate-x-3 blur-2xl"
                            style={{
                              zIndex: -3,
                              background: "rgba(139, 92, 246, 0.08)",
                            }}
                          />
                          <div
                            className="absolute inset-0 rounded-3xl transform translate-y-4 translate-x-2 blur-xl"
                            style={{
                              zIndex: -2,
                              background: "rgba(139, 92, 246, 0.12)",
                            }}
                          />
                          <div
                            className="absolute inset-0 rounded-3xl transform translate-y-2 translate-x-1 blur-lg"
                            style={{
                              zIndex: -1,
                              background: "rgba(139, 92, 246, 0.15)",
                            }}
                          />

                          {/* Ultra Glassy Main Card */}
                          <Card
                            className="w-full h-full border-0 overflow-hidden rounded-3xl relative"
                            style={{
                              background: `
                                linear-gradient(145deg, 
                                  rgba(255, 255, 255, 0.95) 0%, 
                                  rgba(255, 255, 255, 0.85) 50%, 
                                  rgba(255, 255, 255, 0.9) 100%
                                )
                              `,
                              backdropFilter: "blur(20px) saturate(180%)",
                              WebkitBackdropFilter: "blur(20px) saturate(180%)",
                              boxShadow: `
                                0 25px 45px -10px rgba(139, 92, 246, 0.15),
                                0 10px 20px -5px rgba(139, 92, 246, 0.1),
                                0 0 0 1px rgba(255, 255, 255, 0.2),
                                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                                inset 0 -1px 0 rgba(139, 92, 246, 0.05)
                              `,
                              transform: "translateZ(0)",
                              backfaceVisibility: "hidden",
                            }}
                          >
                            {/* Glassy Overlay Effect */}
                            <div
                              className="absolute inset-0 rounded-3xl"
                              style={{
                                background: `
                                  linear-gradient(135deg, 
                                    rgba(255, 255, 255, 0.4) 0%, 
                                    rgba(255, 255, 255, 0.1) 30%,
                                    transparent 50%, 
                                    rgba(139, 92, 246, 0.02) 100%
                                  )
                                `,
                                pointerEvents: "none",
                              }}
                            />

                            {/* Glass Reflection */}
                            <div
                              className="absolute top-0 left-0 right-0 h-1/3 rounded-t-3xl"
                              style={{
                                background: `
                                  linear-gradient(180deg, 
                                    rgba(255, 255, 255, 0.3) 0%, 
                                    rgba(255, 255, 255, 0.1) 50%,
                                    transparent 100%
                                  )
                                `,
                                pointerEvents: "none",
                              }}
                            />

                            <CardContent className="flex flex-col h-full p-6 md:p-8 relative z-10">
                              <div className="flex justify-center mb-6 md:mb-8">
                                <div
                                  className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${cardColor} rounded-full p-4 md:p-5 flex items-center justify-center relative`}
                                  style={{
                                    boxShadow: `
                                      0 10px 25px -5px rgba(139, 92, 246, 0.2),
                                      0 4px 10px -2px rgba(139, 92, 246, 0.1),
                                      inset 0 1px 0 rgba(255, 255, 255, 0.3)
                                    `,
                                  }}
                                >
                                  <Image
                                    src={card.image || "/placeholder.svg"}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-contain filter brightness-0 invert drop-shadow-sm"
                                  />
                                </div>
                              </div>
                              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center leading-tight text-gray-900">
                                {card.question}
                              </h2>
                              <div className="flex-1 flex items-center">
                                <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center">
                                  {card.answer}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </SwipeableCard>
                    ) : (
                      /* Glassy Background Cards */
                      <div className="w-full h-full relative pointer-events-none">
                        {/* Subtle Background Shadows */}
                        <div
                          className="absolute inset-0 rounded-3xl transform translate-y-4 translate-x-2 blur-xl"
                          style={{
                            zIndex: -2,
                            background: "rgba(139, 92, 246, 0.06)",
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-3xl transform translate-y-2 translate-x-1 blur-lg"
                          style={{
                            zIndex: -1,
                            background: "rgba(139, 92, 246, 0.08)",
                          }}
                        />

                        <Card
                          className="w-full h-full border-0 overflow-hidden rounded-3xl relative"
                          style={{
                            background: `
                              linear-gradient(145deg, 
                                rgba(255, 255, 255, 0.9) 0%, 
                                rgba(255, 255, 255, 0.8) 50%, 
                                rgba(255, 255, 255, 0.85) 100%
                              )
                            `,
                            backdropFilter: "blur(15px) saturate(150%)",
                            WebkitBackdropFilter: "blur(15px) saturate(150%)",
                            boxShadow: `
                              0 20px 35px -8px rgba(139, 92, 246, 0.12),
                              0 8px 15px -4px rgba(139, 92, 246, 0.08),
                              0 0 0 1px rgba(255, 255, 255, 0.15),
                              inset 0 1px 0 rgba(255, 255, 255, 0.25)
                            `,
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-3xl"
                            style={{
                              background: `
                                linear-gradient(135deg, 
                                  rgba(255, 255, 255, 0.3) 0%, 
                                  rgba(255, 255, 255, 0.05) 30%,
                                  transparent 50%, 
                                  rgba(139, 92, 246, 0.01) 100%
                                )
                              `,
                              pointerEvents: "none",
                            }}
                          />

                          <CardContent className="flex flex-col h-full p-6 md:p-8 relative z-10">
                            <div className="flex justify-center mb-6 md:mb-8">
                              <div
                                className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${cardColor} rounded-full p-4 md:p-5 flex items-center justify-center`}
                                style={{
                                  boxShadow: `
                                    0 8px 20px -4px rgba(139, 92, 246, 0.15),
                                    0 3px 8px -2px rgba(139, 92, 246, 0.08),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.25)
                                  `,
                                }}
                              >
                                <Image
                                  src={card.image || "/placeholder.svg"}
                                  alt=""
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-contain filter brightness-0 invert"
                                />
                              </div>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center leading-tight text-gray-900">
                              {card.question}
                            </h2>
                            <div className="flex-1 flex items-center">
                              <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center">
                                {card.answer}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextWithSwipe}
              disabled={isAnimating}
              className="group w-14 h-14 md:w-16 md:h-16 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-gray-700 shadow-md"
              aria-label="Next card"
            >
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
