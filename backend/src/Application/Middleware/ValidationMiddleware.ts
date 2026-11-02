import { NextFunction, Request, Response } from 'express';
import { CustomException } from '@Core';

export type FieldErrors = Record<string, string>;

export function buildValidationMiddleware<ReqBody = unknown>(validate: (body: ReqBody) => FieldErrors) {
  return function validationMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const errors = validate(req.body as ReqBody);
    if (Object.keys(errors).length > 0) {
      throw new CustomException(400, 'VAL0001', errors);
    }
    next();
  };
}
