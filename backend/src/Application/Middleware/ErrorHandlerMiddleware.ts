import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { CustomException, ErrorDictionary, StandardResponse } from '@Core';

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const traceID = randomUUID();
  const isCustomException = err instanceof CustomException;

  const statusCode = isCustomException ? err.statusCode : 500;
  const errorCode = isCustomException ? err.errorCode : 'SYS0000';
  const errorMessage = isCustomException ? err.errorMessage : ErrorDictionary.SYS0000;

  const response: StandardResponse = {
    success: false,
    message: errorMessage,
    statusCode,
    data: null,
    errorCode,
    errorMessage,
    traceID,
  };

  res.status(statusCode).json(response);
}
