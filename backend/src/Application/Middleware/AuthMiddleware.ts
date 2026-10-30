import { NextFunction, Request, Response } from 'express';
import { CustomException, ErrorDictionary, IAuthService, RefreshSessionData } from '@Core';

export interface AuthenticatedRequest extends Request {
  auth?: { idUser: number; roles: string[] };
}

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return undefined;
  }
  return header.slice('Bearer '.length).trim();
}

function patchResponseWithRefreshSession(res: Response, refreshSession: RefreshSessionData): void {
  const originalJson = res.json.bind(res);
  res.json = ((body: Record<string, unknown>) => {
    if (body && typeof body === 'object') {
      body.data = { ...((body.data as Record<string, unknown>) ?? {}), refreshSession };
    }
    return originalJson(body);
  }) as Response['json'];
}

export function buildValidateSessionMiddleware(authService: IAuthService) {
  return async function validateSessionMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const accessToken = extractBearerToken(req);
    const refreshTokenHeader = req.headers['x-refresh-token'];
    const refreshToken = typeof refreshTokenHeader === 'string' ? refreshTokenHeader : undefined;

    const outcome = await authService.validateSession(accessToken, refreshToken);

    if (!outcome.success) {
      throw new CustomException(outcome.statusCode, outcome.errorCode ?? 'SYS0000', outcome.errorMessage ?? '');
    }

    req.auth = { idUser: outcome.idUser as number, roles: outcome.roles as string[] };

    if (outcome.refreshSession) {
      patchResponseWithRefreshSession(res, outcome.refreshSession);
    }

    next();
  };
}

export function buildValidateRoleMiddleware(authService: IAuthService) {
  return async function validateRoleMiddleware(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const resourcePath = `${req.baseUrl}${req.route?.path ?? ''}`;
    const roles = req.auth?.roles ?? [];

    const isAllowed = await authService.validateRolePermission(roles, resourcePath);
    if (!isAllowed) {
      throw new CustomException(403, 'AUTH0007', ErrorDictionary.AUTH0007);
    }

    next();
  };
}
