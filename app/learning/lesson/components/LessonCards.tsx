"use client";
import { useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, ChevronLeft, Menu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "../../subject/components/Sidebar";
import SwipeableCard, { type SwipeableCardRef } from "./SwipeableCard";
import learningData from "../../../../data/learning-data.json";

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

interface LessonCard {
  id: string;
  lessonId: string;
  question: string;
  answer: string;
  image: string;
  order: number;
}

interface LessonCardsProps {
  lesson: Lesson;
  subject: Subject;
  cards: LessonCard[];
}

export default function LessonCards({
  lesson,
  subject,
  cards: initialCards,
}: LessonCardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const swipeableCardRef = useRef<SwipeableCardRef>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );

  const allSubjects = learningData.subjects;
  const sortedCards = useMemo(
    () => initialCards.sort((a, b) => a.order - b.order),
    [initialCards]
  );

  const moveToNextCard = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentCardIndex((prev) => (prev + 1) % sortedCards.length);

    // Save progress
    const savedProgress = localStorage.getItem("learning-progress") || "{}";
    const allProgress = JSON.parse(savedProgress);
    if (!allProgress[subject.id]) {
      allProgress[subject.id] = {};
    }

    // Mark as completed when viewed all cards
    const viewedCards = currentCardIndex + 1;
    if (viewedCards >= sortedCards.length) {
      allProgress[subject.id][lesson.id] = true;
      localStorage.setItem("learning-progress", JSON.stringify(allProgress));
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 350); // Match the transition duration
  }, [
    isAnimating,
    currentCardIndex,
    sortedCards.length,
    subject.id,
    lesson.id,
  ]);

  const moveToPrevCard = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentCardIndex(
      (prev) => (prev - 1 + sortedCards.length) % sortedCards.length
    );

    setTimeout(() => {
      setIsAnimating(false);
    }, 350); // Match the transition duration
  }, [isAnimating, sortedCards.length]);

  const handleNextWithSwipe = useCallback(() => {
    if (isAnimating) return;
    swipeableCardRef.current?.triggerSwipe("right");
  }, [isAnimating]);

  const handlePrevWithSwipe = useCallback(() => {
    if (isAnimating) return;
    swipeableCardRef.current?.triggerSwipe("left");
  }, [isAnimating]);

  // Track swipe direction on drag start
  const handleSwipeStart = useCallback((direction: "left" | "right") => {
    setSwipeDirection(direction);
  }, []);

  // Reset swipe direction after animation
  const handleSwipeEnd = useCallback(() => {
    setSwipeDirection(null);
  }, []);

  const cardColors = [
    "from-purple-400 to-purple-200",
    "from-blue-400 to-blue-200",
    "from-pink-400 to-pink-200",
    "from-indigo-400 to-indigo-200",
    "from-cyan-400 to-cyan-200",
  ];

  // Create deck of cards - dynamically based on swipe direction
  const deckCards = useMemo(() => {
    const deck = [];
    if (swipeDirection === "left") {
      // Swiping left: show previous cards
      for (let i = 0; i < Math.min(4, sortedCards.length); i++) {
        const cardIndex =
          (currentCardIndex - i + sortedCards.length) % sortedCards.length;
        deck.push({
          ...sortedCards[cardIndex],
          deckIndex: i,
        });
      }
    } else if (swipeDirection === "right") {
      // Swiping right: show next cards
      for (let i = 0; i < Math.min(4, sortedCards.length); i++) {
        const cardIndex = (currentCardIndex + i) % sortedCards.length;
        deck.push({
          ...sortedCards[cardIndex],
          deckIndex: i,
        });
      }
    } else {
      // Default: show previous cards (like before)
      for (let i = 0; i < Math.min(4, sortedCards.length); i++) {
        const cardIndex =
          (currentCardIndex - i + sortedCards.length) % sortedCards.length;
        deck.push({
          ...sortedCards[cardIndex],
          deckIndex: i,
        });
      }
    }
    deck.reverse();
    return deck;
  }, [currentCardIndex, sortedCards, swipeDirection]);

  const currentProgress = currentCardIndex + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col overflow-hidden">
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                {lesson.title}
              </h1>
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
                style={{
                  width: `${Math.round(
                    (currentProgress / sortedCards.length) * 100
                  )}%`,
                }}
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
                const cardColor = cardColors[card.order % cardColors.length];
                const isTopCard = card.deckIndex === 0;

                // Ultra smooth stacking with perfect timing
                const stackOffsetY = card.deckIndex * 20;
                const stackOffsetX = card.deckIndex * 6;
                const scaleReduction = card.deckIndex * 0.02;
                const opacityReduction = card.deckIndex * 0.15;

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
                        ? "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)"
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
                        onDrag={(direction) => setSwipeDirection(direction)}
                      >
                        {/* Tinder Style Top Card */}
                        <Card className="relative w-full h-full flex flex-col items-center justify-center bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl transition-all duration-300 select-none">
                          {/* Glow border */}
                          <div
                            className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                            style={{
                              boxShadow: `0 0 0 4px rgba(168, 85, 247, 0.15), 0 0 32px 8px rgba(168, 85, 247, 0.12)`,
                            }}
                          />
                          <CardContent className="flex flex-col items-center justify-center h-full z-20">
                            {/* Icon */}
                            <div
                              className={`flex items-center justify-center mb-6 mt-2 w-16 h-16 rounded-full bg-gradient-to-br ${cardColor} bg-opacity-20 shadow-inner border border-purple-200`}
                            >
                              <Image
                                src={card.image || "/placeholder.svg"}
                                alt=""
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain filter brightness-0 invert opacity-80"
                              />
                            </div>
                            {/* Question */}
                            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-4 leading-tight">
                              {card.question}
                            </h2>
                            {/* Answer */}
                            <p className="text-base sm:text-lg text-gray-700 text-center leading-relaxed opacity-90">
                              {card.answer}
                            </p>
                          </CardContent>
                        </Card>
                      </SwipeableCard>
                    ) : (
                      <Card className="relative w-full h-full flex flex-col items-center justify-center bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl transition-all duration-300 select-none">
                        {/* Glow border */}
                        <div
                          className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                          style={{
                            boxShadow: `0 0 0 4px rgba(168, 85, 247, 0.15), 0 0 32px 8px rgba(168, 85, 247, 0.12)`,
                          }}
                        />
                        <CardContent className="flex flex-col items-center justify-center h-full z-20">
                          {/* Icon */}
                          <div
                            className={`flex items-center justify-center mb-6 mt-2 w-16 h-16 rounded-full bg-gradient-to-br ${cardColor} bg-opacity-20 shadow-inner border border-purple-200`}
                          >
                            <Image
                              src={card.image || "/placeholder.svg"}
                              alt=""
                              width={40}
                              height={40}
                              className="w-10 h-10 object-contain filter brightness-0 invert opacity-80"
                            />
                          </div>
                          {/* Question */}
                          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-4 leading-tight">
                            {card.question}
                          </h2>
                          {/* Answer */}
                          <p className="text-base sm:text-lg text-gray-700 text-center leading-relaxed opacity-90">
                            {card.answer}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
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
  );
}
