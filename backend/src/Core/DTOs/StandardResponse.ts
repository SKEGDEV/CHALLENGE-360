export interface StandardResponse<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
  errorCode: string | null;
  errorMessage: string | null;
  traceID: string;
}
