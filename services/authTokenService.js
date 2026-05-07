const crypto = require("crypto");
const { unauthorized } = require("../utils/errors");

const TOKEN_BYTES = 32;

function generateToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token), "utf8")
    .digest("hex");
}

function timingSafeEqualHex(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(left, "hex"),
    Buffer.from(right, "hex"),
  );
}

function verifyTokenHash(token, expectedHash) {
  return timingSafeEqualHex(hashToken(token), expectedHash);
}

function createUserTokens() {
  const dashboardAccessToken = generateToken();
  const unsubscribeToken = generateToken();
  return {
    dashboardAccessToken,
    unsubscribeToken,
    dashboardAccessTokenHash: hashToken(dashboardAccessToken),
    unsubscribeTokenHash: hashToken(unsubscribeToken),
  };
}

function assertDashboardToken(user, token) {
  if (
    !user?.dashboardAccessTokenHash ||
    !verifyTokenHash(token, user.dashboardAccessTokenHash)
  ) {
    throw unauthorized("Gecersiz veya eksik erisim tokeni.");
  }
}

module.exports = {
  generateToken,
  hashToken,
  verifyTokenHash,
  createUserTokens,
  assertDashboardToken,
};
