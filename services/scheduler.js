const cron = require("node-cron");
const { db } = require("../config/firebase");
const { runDailyEmailJob } = require("./emailJobService");

async function sendDailyEmails(options = {}) {
  return runDailyEmailJob(options);
}

function startScheduler() {
  if (!db) {
    console.log("Firebase yapilandirilmamis; scheduler devre disi.");
    return;
  }

  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log(
        `[${new Date().toISOString()}] Gunluk e-posta gorevi tetiklendi.`,
      );
      await sendDailyEmails();
    },
    { timezone: "Europe/Istanbul" },
  );

  console.log("Scheduler baslatildi: her gun 08:00 Europe/Istanbul.");
}

module.exports = { startScheduler, sendDailyEmails };
