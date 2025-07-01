"use client"
import { forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import SwipeableCard, { type SwipeableCardRef } from "./SwipeableCard"

interface CardData {
  id: string
  question: string
  answer: string
  image: string
  order: number
}

interface CardStackProps {
  cards: CardData[]
  currentIndex: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  className?: string
}

const CardStack = forwardRef<SwipeableCardRef, CardStackProps>(
  ({ cards, currentIndex, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, className = "" }, ref) => {
    const cardColors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-cyan-500 to-cyan-600",
    ]

    // Show current card and next 4 cards for the stack effect
    const visibleCards = []
    for (let i = 0; i < Math.min(5, cards.length); i++) {
      const cardIndex = (currentIndex + i) % cards.length
      visibleCards.push(cards[cardIndex])
    }

    return (
      <div className={`relative w-full h-full ${className}`}>
        {visibleCards.map((card, index) => {
          const cardColor = cardColors[card.order % cardColors.length]
          const isTopCard = index === 0

          return (
            <div
              key={`${card.id}-${currentIndex}-${index}`}
              className="absolute inset-0"
              style={{
                zIndex: 10 - index,
                transform: `translateY(${index * 8}px) translateX(${index * 4}px) scale(${1 - index * 0.02})`,
                opacity: Math.max(0.3, 1 - index * 0.15),
              }}
            >
              {isTopCard ? (
                <SwipeableCard
                  ref={ref}
                  onSwipeLeft={onSwipeLeft}
                  onSwipeRight={onSwipeRight}
                  onSwipeUp={onSwipeUp}
                  onSwipeDown={onSwipeDown}
                >
                  <Card className="w-full h-full bg-white shadow-2xl border-0 overflow-hidden rounded-3xl">
                    <CardContent className="flex flex-col h-full p-6 md:p-8">
                      {/* Card Image */}
                      <div className="flex justify-center mb-6 md:mb-8">
                        <div
                          className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${cardColor} rounded-full p-4 md:p-5 shadow-lg flex items-center justify-center`}
                        >
                          <img
                            src={card.image || "/placeholder.svg?height=56&width=56"}
                            alt=""
                            className="w-full h-full object-contain filter brightness-0 invert"
                          />
                        </div>
                      </div>

                      {/* Question */}
                      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center leading-tight text-gray-900">
                        {card.question}
                      </h2>

                      {/* Answer */}
                      <div className="flex-1 flex items-center">
                        <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center">{card.answer}</p>
                      </div>
                    </CardContent>
                  </Card>
                </SwipeableCard>
              ) : (
                <Card className="w-full h-full bg-white shadow-xl border-0 overflow-hidden rounded-3xl">
                  <CardContent className="flex flex-col h-full p-6 md:p-8">
                    <div className="flex justify-center mb-6 md:mb-8">
                      <div
                        className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${cardColor} rounded-full p-4 md:p-5 shadow-lg flex items-center justify-center`}
                      >
                        <img
                          src={card.image || "/placeholder.svg?height=56&width=56"}
                          alt=""
                          className="w-full h-full object-contain filter brightness-0 invert"
                        />
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center leading-tight text-gray-900">
                      {card.question}
                    </h2>
                    <div className="flex-1 flex items-center">
                      <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center">{card.answer}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
      </div>
    )
  },
)

CardStack.displayName = "CardStack"

export default CardStack
