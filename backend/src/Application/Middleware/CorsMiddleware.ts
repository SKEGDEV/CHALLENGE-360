import cors, { CorsOptions } from 'cors';
import { RequestHandler } from 'express';
import { ISettings } from '@Core';

export function buildCorsMiddleware(settings: ISettings): RequestHandler {
  const options: CorsOptions = {
    origin: settings.allowedOrigins,
  };

  return cors(options);
}
