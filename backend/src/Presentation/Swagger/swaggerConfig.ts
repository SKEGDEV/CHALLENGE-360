import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ISettings } from '@Core';

export function setupSwagger(app: Express, _settings: ISettings): void {
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'shopCart API',
        version: '1.0.0',
      },
      tags: [
        { name: 'Auth' },
        { name: 'Client' },
        { name: 'Operator' },
        { name: 'Admin' },
        { name: 'Common' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/Presentation/Controllers/*.ts'],
  });

  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
