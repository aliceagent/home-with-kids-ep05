import { LessonViewer } from "@/components/lesson-viewer";
import beats from "@/data/beats.json";
import type { Beat } from "@/lib/types";

export default function HomePage() {
  return (
    <main className="h-dvh overflow-hidden bg-stone-950">
      <LessonViewer beats={beats as Beat[]} />
    </main>
  );
}
