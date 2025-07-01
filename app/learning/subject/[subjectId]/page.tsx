import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubjectLayout from "../components/SubjectLayout";
import learningData from "../../../../data/learning-data.json";

interface Props {
  params: { subjectId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const awaitedParams = await params;
  const subject = learningData.subjects.find(
    (s) => s.id === awaitedParams.subjectId
  );

  if (!subject) {
    return {
      title: "Subject Not Found",
    };
  }

  return {
    title: `${subject.title} - Learning Hub`,
    description: subject.description,
    keywords: `${subject.title}, ${subject.category}, learning, tutorial`,
  };
}

export async function generateStaticParams() {
  return learningData.subjects.map((subject) => ({
    subjectId: subject.id,
  }));
}

export default async function SubjectPage({ params }: Props) {
  const awaitedParams = await params;
  const subject = learningData.subjects.find(
    (s) => s.id === awaitedParams.subjectId
  );
  const lessons = learningData.lessons.filter(
    (l) => l.subjectId === awaitedParams.subjectId
  );

  if (!subject) {
    notFound();
  }

  return (
    <SubjectLayout
      subject={subject}
      lessons={lessons}
      allSubjects={learningData.subjects}
    />
  );
}
