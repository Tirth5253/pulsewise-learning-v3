import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LessonCards from "../components/LessonCards";
import learningData from "../../../../data/learning-data.json";

interface Props {
  params: { lessonId: string };
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

export default async function LessonPage({ params }: Props) {
  const awaitedParams = await params;
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

  return (
    <LessonCards
      lesson={lesson}
      subject={subject}
      cards={cards.sort((a, b) => a.order - b.order)}
    />
  );
}
