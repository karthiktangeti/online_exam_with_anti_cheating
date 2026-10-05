import "dotenv/config";

import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { initSocket } from "./services/socket.js";
import { setIO } from "./services/io.js";
import { errorHandler } from "./middleware/error.js";

import auth from "./routes/auth.js";
import exams from "./routes/exams.js";
import questions from "./routes/questions.js";
import attempts from "./routes/attempts.js";
import answers from "./routes/answers.js";
import antiCheat from "./routes/antiCheat.js";
import admin from "./routes/admin.js";

// --------------------------------------------------
// APP SETUP
// --------------------------------------------------

const app = express();
const server = http.createServer(app);

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const origins = [
  "http://localhost:5173",
  // "https://online-exam-sepia-gamma.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // Example: Postman, curl, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (origins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.set("trust proxy", 1);

app.use(helmet());

app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options("*", cors(corsOptions));

app.use(
  express.json({
    limit: "100kb",
  }),
);

app.use(mongoSanitize());

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 600,

    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,

    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Online Exam API is running",
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use("/api/auth", auth);

app.use("/api/exams", exams);

app.use("/api/questions", questions);

app.use("/api/attempts", attempts);

app.use("/api/answers", answers);

app.use("/api/anti-cheat", antiCheat);

app.use("/api/admin", admin);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use(errorHandler);

// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------

const io = new Server(server, {
  cors: {
    origin: origins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

setIO(io);

initSocket(io);

// --------------------------------------------------
// DATABASE + SERVER START
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
      console.log("Allowed CORS origins:");
      origins.forEach((origin) => {
        console.log(`- ${origin}`);
      });
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error.message);
    process.exit(1);
  });
