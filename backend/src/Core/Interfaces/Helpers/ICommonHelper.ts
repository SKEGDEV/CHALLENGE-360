import { StandardResponse } from '../../DTOs/StandardResponse';

export interface ICommonHelper {
  buildResponse<T>(
    statusCode: number,
    data: T | null,
    message: string,
    errorCode?: string | null,
    errorMessage?: string | null,
  ): StandardResponse<T>;
  isValidEmail(email: string): boolean;
}
