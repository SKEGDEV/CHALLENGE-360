export interface ApiErrorBody {
  success: boolean;
  message: string;
  statusCode: number;
  data: null;
  errorCode: string | null;
  errorMessage: string | Record<string, string> | null;
  traceID: string;
}

export class ApiError extends Error {
  status: number;
  errorCode: string | null;
  fieldErrors: Record<string, string> | null;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(body?.message ?? message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = body?.errorCode ?? null;
    this.fieldErrors =
      body?.errorMessage && typeof body.errorMessage === 'object' ? body.errorMessage : null;
    this.body = body;
  }
}
