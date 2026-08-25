# home-with-kids-ep05

A small **Family Chore Board** web app built with [Next.js](https://nextjs.org) (App Router),
TypeScript, and Tailwind CSS. Add chores, assign them to a kid, and earn points as a family.

## Tech stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- ESLint (`eslint-config-next`)

## Getting started

Requires Node.js 22+.

```bash
npm ci        # install dependencies (uses package-lock.json)
npm run dev   # start the dev server on http://localhost:3000
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## API

The app includes a Next.js Route Handler at `src/app/api/chores/route.ts`:

- `GET /api/chores` — returns the seed list of chores.
- `POST /api/chores` — validates and returns a new chore (`{ title, assignee, points }`).

## Cloud Agent environment

Environment setup for Cursor Cloud Agents is defined in
[`.cursor/environment.json`](.cursor/environment.json): `npm ci` installs
dependencies and a `dev` terminal runs `npm run dev`.
