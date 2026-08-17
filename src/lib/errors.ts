/** An error with an associated HTTP status code. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Route not found.") {
    super(404, message);
    this.name = "NotFoundError";
  }
}
