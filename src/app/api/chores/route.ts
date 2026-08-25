import { NextResponse } from "next/server";

export type Chore = {
  id: string;
  title: string;
  assignee: string;
  points: number;
  done: boolean;
};

const SEED_CHORES: Chore[] = [
  { id: "seed-1", title: "Make the bed", assignee: "Mia", points: 5, done: false },
  { id: "seed-2", title: "Feed the dog", assignee: "Leo", points: 10, done: false },
  { id: "seed-3", title: "Set the table", assignee: "Mia", points: 5, done: false },
  { id: "seed-4", title: "Water the plants", assignee: "Leo", points: 8, done: false },
];

export async function GET() {
  return NextResponse.json({ chores: SEED_CHORES });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { title, assignee, points } = (body ?? {}) as Partial<Chore>;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { error: "A chore needs a title." },
      { status: 400 },
    );
  }

  const chore: Chore = {
    id: `chore-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    title: title.trim(),
    assignee:
      typeof assignee === "string" && assignee.trim().length > 0
        ? assignee.trim()
        : "Unassigned",
    points:
      typeof points === "number" && Number.isFinite(points) && points > 0
        ? Math.round(points)
        : 5,
    done: false,
  };

  return NextResponse.json({ chore }, { status: 201 });
}
