import { Request, Response, Router } from 'express';
import { IAuthService, ICommonService } from '@Core';
import {
  AuthenticatedRequest,
  buildValidateRoleMiddleware,
  buildValidateSessionMiddleware,
} from '@Application';

export class CommonController {
  public readonly router: Router;

  constructor(
    private readonly commonService: ICommonService,
    private readonly authService: IAuthService,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  async warmCatalogCache(): Promise<void> {
    await this.commonService.warmCatalogCache();
  }

  private registerRoutes(): void {
    const validateSession = buildValidateSessionMiddleware(this.authService);
    const validateRole = buildValidateRoleMiddleware(this.authService);

    /**
     * @openapi
     * /api/common/product:
     *   get:
     *     tags: [Common]
     *     summary: Lista productos de forma paginada con sus variantes y fotografias
     *     parameters:
     *       - in: query
     *         name: pageNumber
     *         schema: { type: integer, default: 1 }
     *       - in: query
     *         name: pageSize
     *         schema: { type: integer, default: 20 }
     *       - in: query
     *         name: idProductType
     *         schema: { type: integer }
     *       - in: query
     *         name: productName
     *         schema: { type: string }
     *       - in: query
     *         name: priceFrom
     *         schema: { type: number }
     *       - in: query
     *         name: priceTo
     *         schema: { type: number }
     *       - in: query
     *         name: from
     *         schema: { type: string, format: date-time }
     *       - in: query
     *         name: to
     *         schema: { type: string, format: date-time }
     *     responses:
     *       200:
     *         description: Listado paginado de productos
     */
    this.router.get('/product', async (req: Request, res: Response) => {
      const response = await this.commonService.getProducts({
        pageNumber: req.query.pageNumber ? Number(req.query.pageNumber) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        idProductType: req.query.idProductType ? Number(req.query.idProductType) : undefined,
        productName: typeof req.query.productName === 'string' ? req.query.productName : undefined,
        priceFrom: req.query.priceFrom ? Number(req.query.priceFrom) : undefined,
        priceTo: req.query.priceTo ? Number(req.query.priceTo) : undefined,
        from: typeof req.query.from === 'string' ? req.query.from : undefined,
        to: typeof req.query.to === 'string' ? req.query.to : undefined,
      });
      res.status(200).json(response);
    });

    /**
     * @openapi
     * /api/common/catalog:
     *   get:
     *     tags: [Common]
     *     summary: Obtiene los catalogos de cache correspondientes al rol (o roles) del usuario autenticado
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Catalogos disponibles para el rol del usuario
     */
    this.router.get('/catalog', validateSession, async (req: AuthenticatedRequest, res: Response) => {
      const response = await this.commonService.getCatalog(req.auth!.roles);
      res.status(200).json(response);
    });

    /**
     * @openapi
     * /api/common/file:
     *   get:
     *     tags: [Common]
     *     summary: Obtiene un archivo almacenado en S3 (para mostrarlo en el frontend)
     *     parameters:
     *       - in: query
     *         name: imageBucketKey
     *         required: true
     *         schema: { type: string }
     *       - in: query
     *         name: contentType
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Contenido binario del archivo (o un archivo vacio si no existe)
     *         content:
     *           application/octet-stream:
     *             schema:
     *               type: string
     *               format: binary
     */
    this.router.get('/file', async (req: Request, res: Response) => {
      const imageBucketKey = typeof req.query.imageBucketKey === 'string' ? req.query.imageBucketKey : '';
      const contentType =
        typeof req.query.contentType === 'string' ? req.query.contentType : 'application/octet-stream';

      const file = await this.commonService.getFile(imageBucketKey, contentType);
      res.status(200).contentType(file.contentType).send(file.body);
    });

    /**
     * @openapi
     * /api/common/dashboard:
     *   get:
     *     tags: [Common]
     *     summary: Metricas de envios para administradores y operadores (mas/menos vendidos, categorias top, notificaciones recientes)
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Datos del dashboard
     */
    this.router.get('/dashboard', validateSession, validateRole, async (_req: Request, res: Response) => {
      const response = await this.commonService.getDashboard();
      res.status(200).json(response);
    });
  }
}
