const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes/api");
const { errorMiddleware } = require("./utils/errors");

function parseAllowedOrigins() {
  const configured = [
    process.env.APP_ORIGIN,
    ...(process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim()),
  ].filter(Boolean);

  return new Set([
    ...configured,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8888",
    "http://127.0.0.1:8888",
  ]);
}

function createCorsOptions() {
  const allowedOrigins = parseAllowedOrigins();
  return {
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin not allowed"));
    },
  };
}

function securityHeaders(req, res, next) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'",
  );

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  next();
}

function createApp(options = {}) {
  const app = express();
  const serveStatic = options.serveStatic !== false;

  app.use(securityHeaders);
  app.use(cors(createCorsOptions()));
  app.options("*", cors(createCorsOptions()));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  if (serveStatic) {
    app.use(express.static(path.join(__dirname, "public")));
    app.get("/", (req, res) =>
      res.sendFile(path.join(__dirname, "public", "index.html")),
    );
    app.get("/test", (req, res) =>
      res.sendFile(path.join(__dirname, "public", "test.html")),
    );
  }

  app.use("/api", apiRoutes);
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp, createCorsOptions, securityHeaders };
