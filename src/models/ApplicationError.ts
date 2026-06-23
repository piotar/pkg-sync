/** An expected, user-facing error — printed as a clean one-liner instead of a stack trace. */
export class ApplicationError extends Error {
  public readonly exitCode = 1;

  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}
