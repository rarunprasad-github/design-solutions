export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error") {
      super(message, 500);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = "Too Many Requests") {
      super(message, 429);
  }
}

