import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LessonCards from "../components/LessonCards";
import SwipeCards from "../components/SwipeCards";
import learningData from "../../../../data/learning-data.json";

interface Props {
  params: { lessonId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const awaitedParams = await params;
  const lesson = learningData.lessons.find(
    (l) => l.id === awaitedParams.lessonId
  );
  const subject = lesson
    ? learningData.subjects.find((s) => s.id === lesson.subjectId)
    : null;

  if (!lesson || !subject) {
    return {
      title: "Lesson Not Found",
    };
  }

  return {
    title: `${lesson.title} - ${subject.title} | Learning Hub`,
    description: lesson.description,
    keywords: `${lesson.title}, ${subject.title}, ${subject.category}, learning, tutorial`,
  };
}

export async function generateStaticParams() {
  return learningData.lessons.map((lesson) => ({
    lessonId: lesson.id,
  }));
}

export default async function LessonPage({ params, searchParams }: Props) {
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  const lesson = learningData.lessons.find(
    (l) => l.id === awaitedParams.lessonId
  );
  const cards = learningData.cards.filter(
    (c) => c.lessonId === awaitedParams.lessonId
  );
  const subject = lesson
    ? learningData.subjects.find((s) => s.id === lesson.subjectId)
    : null;

  if (!lesson || !subject) {
    notFound();
  }

  // Check if we should use the new swipe-style cards
  const useSwipeCards =
    awaitedSearchParams.swipe === "true" ||
    process.env.NEXT_PUBLIC_USE_SWIPE_CARDS === "true";

  if (useSwipeCards) {
    return (
      <SwipeCards
        lesson={lesson}
        subject={subject}
        cards={cards.sort((a, b) => a.order - b.order)}
        onCardComplete={(cardId: string, direction: "left" | "right") => {
          console.log(`Card ${cardId} completed with direction: ${direction}`);
        }}
        onAllCardsComplete={() => {
          console.log("All cards completed!");
        }}
      />
    );
  }

  return (
    <LessonCards
      lesson={lesson}
      subject={subject}
      cards={cards.sort((a, b) => a.order - b.order)}
    />
  );
}
