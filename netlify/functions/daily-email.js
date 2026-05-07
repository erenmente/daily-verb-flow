const { schedule } = require("@netlify/functions");
const { runDailyEmailJob } = require("../../services/emailJobService");

async function handler() {
  try {
    const summary = await runDailyEmailJob({ maxMs: 8000 });
    return {
      statusCode: 200,
      body: JSON.stringify(summary),
    };
  } catch (error) {
    console.error("Scheduled email job failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Scheduled email job failed." }),
    };
  }
}

module.exports.handler = schedule("0 5 * * *", handler);
