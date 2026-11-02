export type ErrorMessageDetail = string | Record<string, string>;

export class CustomException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly errorMessage: ErrorMessageDetail,
  ) {
    super(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    this.name = 'CustomException';
  }
}
