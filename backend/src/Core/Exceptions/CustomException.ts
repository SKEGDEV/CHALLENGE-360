export class CustomException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly errorMessage: string,
  ) {
    super(errorMessage);
    this.name = 'CustomException';
  }
}
