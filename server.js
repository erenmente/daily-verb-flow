require("dotenv").config();

const { createApp } = require("./app");
const { startScheduler } = require("./services/scheduler");
const { db } = require("./config/firebase");

const PORT = process.env.PORT || 3000;
const app = createApp({ serveStatic: true });

app.listen(PORT, () => {
  console.log(`Daily Verb Flow server is running at http://localhost:${PORT}`);
  if (db) {
    startScheduler();
  } else {
    console.log("Firebase is not configured; API and scheduler are limited.");
  }
});

module.exports = app;
