# ExamGuard – Online Examination Platform with Anti-Cheat Monitoring
React + Vite + Tailwind | Node + Express + MongoDB + Socket.IO

## 1. Setup
1. **MongoDB**: create a free cluster on MongoDB Atlas (or use local MongoDB) and copy the connection string.
2. **Backend**
   ```
   cd backend
   npm install
   ```
   Edit `backend/.env`: set `MONGO_URI` (JWT_SECRET is already generated), optionally `ADMIN_EMAIL` / `ADMIN_PASSWORD`. To enable AI question drafts in Admin → Questions, set `GROQ_API_KEY` (and optionally `GROQ_MODEL`) in the backend environment. Never put this key in the frontend `.env`. The assistant supports 1–20 questions per generation and adds reviewed drafts in one click.
   ```
   npm run seed:admin     # creates the first admin
   npm run dev            # http://localhost:5000
   ```
3. **Frontend**
   ```
   cd frontend
   npm install
   npm run dev            # http://localhost:5173
   ```
   `frontend/.env` → `VITE_API_URL=http://localhost:5000`

## 2. Quick test
1. Login as admin → **Exams** → New exam (start date in the past, end date in the future) → **Questions** → add a few.
2. Register a student (second browser/profile) → dashboard → Start Exam → accept consent → allow camera → Begin.
3. Answer questions (auto-saved), refresh to resume, submit → result page.
4. **Anti-cheat tests** (during exam): switch tab, press Esc (fullscreen exit), right-click, Ctrl+C/V/X, F12, cover the camera (NO_FACE, Chrome/Edge), open the same exam URL in a second tab (MULTIPLE_SESSION).
5. Admin → **Anti-Cheat Reports** → Report: counts, risk label, timeline.
6. Timer test: create a 1-minute exam; let it expire → auto-submit. Tampering with the client timer doesn't help: the server rejects answers after `endTime`.

## 3. Deploy
Backend → Render (root `backend`, start `npm start`, env: MONGO_URI, JWT_SECRET, CLIENT_URL=<vercel url>). Frontend → Vercel (root `frontend`, env `VITE_API_URL=<render url>`). The frontend includes a Vercel SPA rewrite so refreshing routes such as `/student/exams` serves the React app instead of returning 404. Atlas: allow Render's IPs (0.0.0.0/0 for testing).

## 4. Design notes
- Backend is the source of truth: scoring, deadlines, `correctAnswer` never leaves the server before submission.
- One attempt per student/exam (unique index); refresh resumes the same attempt.
- Anti-cheat events are "signals", weights in `backend/utils/weights.js` (or env `INCIDENT_WEIGHTS`). Risk labels: Normal (<3), Review Recommended (<8), Multiple Incidents (8+).
- Webcam frames are analysed locally via the browser `FaceDetector` API (Chrome/Edge; may need `chrome://flags/#enable-experimental-web-platform-features`). No video is stored or uploaded.
- Not included: head-pose, object/phone detection (need ML models; `LOOKING_AWAY`/`PHONE_DETECTED` exist in the schema and API ready for them), charts, Settings page.
