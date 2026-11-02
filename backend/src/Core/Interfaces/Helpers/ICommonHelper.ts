import { StandardResponse } from '../../DTOs/StandardResponse';

export interface ICommonHelper {
  buildResponse<T>(
    statusCode: number,
    data: T | null,
    message: string,
    errorCode?: string | null,
    errorMessage?: string | Record<string, string> | null,
  ): StandardResponse<T>;
}
