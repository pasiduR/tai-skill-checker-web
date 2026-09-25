# TAI Skill Checker Frontend

React frontend for the admin assessment workflow and employee realtime voice assessment journey.

## Run locally

1. Copy `.env.example` to `.env` and set `VITE_API_URL` when the API is not served at `http://localhost:3000`.
2. Start the backend, then run:

   ```sh
   npm install
   npm run dev
   ```

The Vite development server runs at `http://localhost:5173` and proxies `/api` to the backend by default.

During development, Boneyard automatically captures the loading fixtures from
`/__boneyard` at the configured responsive breakpoints and refreshes
`src/bones`. Keep the generated registry imported once from `src/main.tsx` and
commit regenerated bone files whenever loading layouts change.

For a manual rebuild, keep the Vite server running in one terminal and run the
project command in another:

```sh
npm run bones
```

Use this command instead of a bare `npx boneyard-js build`: port `3000` belongs
to the backend, while the React app and its `<Skeleton>` components run on port
`5173`.

If the first capture reports that Chromium is missing, install the browser used
by Boneyard once with `npx playwright install chromium` and restart Vite.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Phase One includes session-aware role routing, the admin shell, assessment list/detail pages, manual and AI-assisted draft editing, PDF upload and processing, publishing, and bulk invitation delivery status.

Phase Two adds invitation acceptance, employee preparation and microphone checks, server-authorized LiveKit room entry, explicit realtime session states, live transcription, interruption handling, and a locked completion screen.

Post-interview evaluation adds the admin-only `/admin/evaluations` queue with assessment/status filters, retry for failed rows, and links to the existing attempt report. Reports poll only while an evaluation is queued or processing, show evidence-linked 1–5 competency results when complete, and stop with an explicit retryable failure state when evaluation fails.
