// An error we throw on purpose, with an HTTP status code.
class AppError extends Error {
  constructor(message, statusCode = 500, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.assign(this, extra);
  }
}
module.exports = AppError;
