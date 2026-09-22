# TAI Skill Checker Frontend

React frontend for the admin assessment creation workflow.

## Run locally

1. Copy `.env.example` to `.env` and set `VITE_API_URL` when the API is not served at `http://localhost:3000`.
2. Start the backend, then run:

   ```sh
   npm install
   npm run dev
   ```

The Vite development server runs at `http://localhost:5173` and proxies `/api` to the backend by default.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Phase One includes session-aware role routing, the admin shell, assessment list/detail pages, manual and AI-assisted draft editing, PDF upload and processing, publishing, and bulk invitation delivery status.
