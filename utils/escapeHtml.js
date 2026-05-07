const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => HTML_ESCAPE_MAP[char],
  );
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

module.exports = { escapeHtml, escapeAttribute };
