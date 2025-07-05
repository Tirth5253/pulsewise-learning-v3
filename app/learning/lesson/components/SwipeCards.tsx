"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SwipeableCard, { type SwipeableCardRef } from "./SwipeableCard";

interface LessonCard {
  id: string;
  lessonId: string;
  question: string;
  answer: string;
  image: string;
  order: number;
}

interface Subject {
  id: string;
  title: string;
  color: string;
}

interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  totalCards: number;
}

interface SwipeCardsProps {
  lesson: Lesson;
  subject: Subject;
  cards: LessonCard[];
  onCardComplete?: (cardId: string, direction: "left" | "right") => void;
  onAllCardsComplete?: () => void;
}

const CARD_COLORS = [
  "from-purple-400 to-purple-200",
  "from-blue-400 to-blue-200",
  "from-pink-400 to-pink-200",
  "from-indigo-400 to-indigo-200",
  "from-cyan-400 to-cyan-200",
];

const SwipeCards: React.FC<SwipeCardsProps> = ({
  lesson,
  subject,
  cards,
  onCardComplete,
  onAllCardsComplete,
}) => {
  const sortedCards = useMemo(
    () => cards.sort((a, b) => a.order - b.order),
    [cards]
  );
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swipeableCardRef = React.useRef<SwipeableCardRef>(null);

  // Only show the top card and the next few for stack effect
  const visibleCards = useMemo(() => {
    return sortedCards.slice(current, current + 3);
  }, [sortedCards, current]);

  const handleSwipeLeft = useCallback(() => {
    if (current < sortedCards.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      onCardComplete?.(sortedCards[current].id, "left");

      // Smooth transition delay - longer for better visual effect
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setTimeout(() => setIsTransitioning(false), 400);
      }, 300);
    } else if (current >= sortedCards.length - 1) {
      onCardComplete?.(sortedCards[current].id, "left");
      onAllCardsComplete?.();
    }
  }, [
    current,
    sortedCards,
    onCardComplete,
    onAllCardsComplete,
    isTransitioning,
  ]);

  const handleSwipeRight = useCallback(() => {
    if (current < sortedCards.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      onCardComplete?.(sortedCards[current].id, "right");

      // Smooth transition delay - longer for better visual effect
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setTimeout(() => setIsTransitioning(false), 400);
      }, 300);
    } else if (current >= sortedCards.length - 1) {
      onCardComplete?.(sortedCards[current].id, "right");
      onAllCardsComplete?.();
    }
  }, [
    current,
    sortedCards,
    onCardComplete,
    onAllCardsComplete,
    isTransitioning,
  ]);

  // Progress dots
  const progressDots = useMemo(
    () => (
      <div className="flex justify-center mt-6">
        {sortedCards.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full mx-1 transition-all duration-200 ${
              i === current ? "bg-purple-400 scale-125" : "bg-purple-200"
            }`}
          />
        ))}
      </div>
    ),
    [sortedCards, current]
  );

  // Navigation buttons
  const handlePrevious = useCallback(() => {
    if (current > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((c) => c - 1);
        setTimeout(() => setIsTransitioning(false), 400);
      }, 200);
    }
  }, [current, isTransitioning]);

  const handleNext = useCallback(() => {
    if (current < sortedCards.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setTimeout(() => setIsTransitioning(false), 400);
      }, 200);
    }
  }, [current, sortedCards.length, isTransitioning]);

  if (sortedCards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-2">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No cards available
          </h2>
          <p className="text-gray-600">
            This lesson doesn't have any cards yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-4 sm:py-8 px-2">
      {/* Lesson Info */}
      <div className="text-center mb-4 sm:mb-8 px-4">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {lesson.description}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <span className="text-sm text-gray-500">{subject.title}</span>
        </div>
      </div>

      <div
        className="w-full max-w-md mx-auto relative"
        style={{ minHeight: "calc(100vh - 300px)", maxHeight: "70vh" }}
      >
        {/* Card Stack */}
        {visibleCards.map((card, i) => {
          const color = CARD_COLORS[card.order % CARD_COLORS.length];
          const zIndex = visibleCards.length - i;
          const isTop = i === 0;
          const isNext = i === 1;
          // Only render the top card and the next card (as background)
          if (!isTop && !isNext) return null;
          return (
            <div
              key={`${card.id}-${current}`}
              className="absolute w-full h-full flex items-center justify-center select-none"
              style={{
                zIndex: isTop ? 10 : 5,
                pointerEvents: isTop ? "auto" : "none",
                opacity: 1,
                transform: isTop
                  ? "scale(1) translateY(0px)"
                  : `scale(0.96) translateY(12px)`,
                transition:
                  "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {isTop ? (
                <SwipeableCard
                  ref={swipeableCardRef}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  className="w-full h-full"
                >
                  <Card className="relative w-full h-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-3xl transition-all duration-500 select-none">
                    {/* Glow border */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                      style={{
                        boxShadow: `0 0 0 4px rgba(168, 85, 247, 0.15), 0 0 32px 8px rgba(168, 85, 247, 0.12)`,
                      }}
                    />
                    <CardContent className="flex flex-col items-center justify-center h-full z-20 p-4 sm:p-6">
                      {/* Icon */}
                      <div
                        className={`flex items-center justify-center mb-4 sm:mb-6 mt-2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${color} bg-opacity-20 shadow-inner border border-purple-200`}
                      >
                        <img
                          src={
                            card.image || "/placeholder.svg?height=56&width=56"
                          }
                          alt=""
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain filter brightness-0 invert opacity-80"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      {/* Question */}
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                        {card.question}
                      </h2>
                      {/* Answer */}
                      <p className="text-sm sm:text-base md:text-lg text-gray-700 text-center leading-relaxed opacity-90 px-2">
                        {card.answer}
                      </p>
                    </CardContent>
                  </Card>
                </SwipeableCard>
              ) : (
                <Card className="relative w-full h-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-3xl transition-all duration-500 select-none">
                  {/* Glow border */}
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                    style={{
                      boxShadow: `0 0 0 4px rgba(168, 85, 247, 0.15), 0 0 32px 8px rgba(168, 85, 247, 0.12)`,
                    }}
                  />
                  <CardContent className="flex flex-col items-center justify-center h-full z-20 p-4 sm:p-6">
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center mb-4 sm:mb-6 mt-2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${color} bg-opacity-20 shadow-inner border border-purple-200`}
                    >
                      <img
                        src={
                          card.image || "/placeholder.svg?height=56&width=56"
                        }
                        alt=""
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain filter brightness-0 invert opacity-80"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    {/* Question */}
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                      {card.question}
                    </h2>
                    {/* Answer */}
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 text-center leading-relaxed opacity-90 px-2">
                      {card.answer}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}

        {progressDots}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-8 px-4">
        <button
          onClick={handlePrevious}
          disabled={current === 0}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-purple-100 text-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors text-sm sm:text-base font-medium"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={current === sortedCards.length - 1}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-purple-100 text-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors text-sm sm:text-base font-medium"
        >
          Next →
        </button>
      </div>

      {/* Progress Text */}
      <div className="text-center mt-3 sm:mt-4 px-4">
        <p className="text-xs sm:text-sm text-gray-500">
          {current + 1} of {sortedCards.length} cards
        </p>
      </div>
    </div>
  );
};

export default React.memo(SwipeCards);
