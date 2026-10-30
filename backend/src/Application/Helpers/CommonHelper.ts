import { randomUUID } from 'crypto';
import { ICommonHelper, StandardResponse } from '@Core';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class CommonHelper implements ICommonHelper {
  buildResponse<T>(
    statusCode: number,
    data: T | null,
    message: string,
    errorCode: string | null = null,
    errorMessage: string | null = null,
  ): StandardResponse<T> {
    return {
      success: statusCode >= 200 && statusCode < 300,
      message,
      statusCode,
      data,
      errorCode,
      errorMessage,
      traceID: randomUUID(),
    };
  }

  isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }
}
