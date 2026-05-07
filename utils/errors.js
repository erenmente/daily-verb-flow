class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function badRequest(message, details) {
  return new ApiError(400, "bad_request", message, details);
}

function unauthorized(message = "Yetkisiz istek.") {
  return new ApiError(401, "unauthorized", message);
}

function forbidden(message = "Bu islem icin yetkiniz yok.") {
  return new ApiError(403, "forbidden", message);
}

function notFound(message = "Kayit bulunamadi.") {
  return new ApiError(404, "not_found", message);
}

function conflict(message) {
  return new ApiError(409, "conflict", message);
}

function serviceUnavailable(message) {
  return new ApiError(503, "service_unavailable", message);
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const payload = {
    success: false,
    error: {
      code: err instanceof ApiError ? err.code : "internal_error",
      message:
        err instanceof ApiError
          ? err.message
          : "Beklenmeyen bir hata olustu. Lutfen daha sonra tekrar deneyin.",
    },
  };

  if (err instanceof ApiError && err.details) {
    payload.error.details = err.details;
  }

  if (!(err instanceof ApiError)) {
    console.error("Unhandled API error:", err);
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  ApiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serviceUnavailable,
  asyncHandler,
  errorMiddleware,
};
