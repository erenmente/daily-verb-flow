const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

process.env.FIREBASE_PROJECT_ID = "";
process.env.FIREBASE_CLIENT_EMAIL = "";
process.env.FIREBASE_PRIVATE_KEY = "";
process.env.GEMINI_API_KEY = "";

const { createApp } = require("../app");

async function withServer(fn) {
  const app = createApp({ serveStatic: false });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("POST /api/register rejects invalid email before Firebase access", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada Lovelace", email: "bad-email" }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "bad_request");
  });
});

test("POST /api/submit-test rejects score greater than totalQuestions", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/submit-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "user_12345",
        token: "a".repeat(43),
        score: 16,
        totalQuestions: 15,
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.error.message, /Skor/);
  });
});

test("GET /api/dashboard/:userId requires token", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/dashboard/user_12345`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "bad_request");
  });
});
