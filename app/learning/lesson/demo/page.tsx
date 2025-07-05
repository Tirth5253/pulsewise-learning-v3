"use client";

import React from "react";
import SwipeCards from "../components/SwipeCards";
import learningData from "../../../../data/learning-data.json";

// Sample data for demo
const demoLesson = {
  id: "demo-lesson",
  subjectId: "math",
  title: "Basic Mathematics",
  description: "Learn fundamental math concepts through interactive cards",
  totalCards: 5,
};

const demoSubject = {
  id: "math",
  title: "Mathematics",
  color: "#8B5CF6",
};

const demoCards = [
  {
    id: "card-1",
    lessonId: "demo-lesson",
    question: "What is 2 + 2?",
    answer: "4",
    image: "/placeholder.svg",
    order: 1,
  },
  {
    id: "card-2",
    lessonId: "demo-lesson",
    question: "What is the square root of 16?",
    answer: "4",
    image: "/placeholder.svg",
    order: 2,
  },
  {
    id: "card-3",
    lessonId: "demo-lesson",
    question: "What is 5 × 6?",
    answer: "30",
    image: "/placeholder.svg",
    order: 3,
  },
  {
    id: "card-4",
    lessonId: "demo-lesson",
    question: "What is 20 ÷ 4?",
    answer: "5",
    image: "/placeholder.svg",
    order: 4,
  },
  {
    id: "card-5",
    lessonId: "demo-lesson",
    question: "What is 3²?",
    answer: "9",
    image: "/placeholder.svg",
    order: 5,
  },
];

export default function SwipeCardsDemo() {
  const handleCardComplete = (cardId: string, direction: "left" | "right") => {
    console.log(`Card ${cardId} completed with direction: ${direction}`);
  };

  const handleAllCardsComplete = () => {
    console.log("All cards completed!");
    alert("Congratulations! You've completed all the cards!");
  };

  return (
    <SwipeCards
      lesson={demoLesson}
      subject={demoSubject}
      cards={demoCards}
      onCardComplete={handleCardComplete}
      onAllCardsComplete={handleAllCardsComplete}
    />
  );
}
