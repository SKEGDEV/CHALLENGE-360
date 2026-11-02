import { Request, Response, Router } from 'express';
import {
  CreateCuponRequest,
  CreateProductRequest,
  CreateProductTypeRequest,
  IAdminService,
  IAuthService,
  PresignedFileRequest,
  UpdateCuponRequest,
  UpdateProductRequest,
  UpdateProductTypeRequest,
} from '@Core';
import {
  AuthenticatedTypedRequest,
  buildValidateRoleMiddleware,
  buildValidateSessionMiddleware,
  buildValidationMiddleware,
  validateCreateProductRequest,
  validateCuponRequest,
  validatePresignedFileRequest,
  validateProductTypeRequest,
  validateUpdateProductRequest,
} from '@Application';

export class AdminController {
  public readonly router: Router;

  constructor(
    private readonly adminService: IAdminService,
    private readonly authService: IAuthService,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    const validateSession = buildValidateSessionMiddleware(this.authService);
    const validateRole = buildValidateRoleMiddleware(this.authService);
    const protect = [validateSession, validateRole];

    const validateCreateProduct = buildValidationMiddleware(validateCreateProductRequest);
    const validateUpdateProduct = buildValidationMiddleware(validateUpdateProductRequest);
    const validatePresignedFile = buildValidationMiddleware(validatePresignedFileRequest);
    const validateCupon = buildValidationMiddleware(validateCuponRequest);
    const validateProductType = buildValidationMiddleware(validateProductTypeRequest);

    /**
     * @openapi
     * /api/admin/product:
     *   post:
     *     tags: [Admin]
     *     summary: Crea un producto junto con sus variantes y fotografias
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [idProductType, productName, productDescription, productPublicCode, variants]
     *             properties:
     *               idProductType: { type: integer }
     *               productName: { type: string }
     *               productDescription: { type: string }
     *               productPublicCode: { type: string }
     *               variants:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/AdminVariant'
     *     responses:
     *       200:
     *         description: Producto creado correctamente
     */
    this.router.post(
      '/product',
      ...protect,
      validateCreateProduct,
      async (req: AuthenticatedTypedRequest<unknown, CreateProductRequest>, res: Response) => {
        const response = await this.adminService.createProduct(req.body, req.auth!.idUser);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/admin/product/{idProduct}:
     *   get:
     *     tags: [Admin]
     *     summary: Obtiene el detalle de un producto con sus variantes y fotografias
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idProduct
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Detalle del producto
     */
    this.router.get(
      '/product/:idProduct',
      ...protect,
      async (req: Request<{ idProduct: string }>, res: Response) => {
        const response = await this.adminService.getProductDetail(Number(req.params.idProduct));
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/admin/product:
     *   put:
     *     tags: [Admin]
     *     summary: Actualiza un producto, agregando/eliminando variantes y fotografias segun corresponda
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [idProduct, idProductType, productName, productDescription, variants]
     *             properties:
     *               idProduct: { type: integer }
     *               idProductType: { type: integer }
     *               productName: { type: string }
     *               productDescription: { type: string }
     *               variants:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/AdminVariant'
     *     responses:
     *       200:
     *         description: Producto actualizado correctamente
     */
    this.router.put(
      '/product',
      ...protect,
      validateUpdateProduct,
      async (req: AuthenticatedTypedRequest<unknown, UpdateProductRequest>, res: Response) => {
        const response = await this.adminService.updateProduct(req.body, req.auth!.idUser);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/admin/product/{idProduct}:
     *   delete:
     *     tags: [Admin]
     *     summary: Elimina (inactiva) un producto junto con sus variantes
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idProduct
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Producto eliminado correctamente
     */
    this.router.delete(
      '/product/:idProduct',
      ...protect,
      async (req: AuthenticatedTypedRequest<{ idProduct: string }>, res: Response) => {
        const response = await this.adminService.deleteProduct(Number(req.params.idProduct), req.auth!.idUser);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/admin/stored-file:
     *   post:
     *     tags: [Admin]
     *     summary: Genera URLs prefirmadas de S3 para subir archivos
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [files]
     *             properties:
     *               files:
     *                 type: array
     *                 items:
     *                   type: object
     *                   required: [fileName, fileKey, fileContentType]
     *                   properties:
     *                     fileName: { type: string }
     *                     fileKey: { type: string }
     *                     fileContentType: { type: string }
     *     responses:
     *       200:
     *         description: Urls generadas correctamente
     */
    this.router.post(
      '/stored-file',
      ...protect,
      validatePresignedFile,
      async (req: Request<unknown, unknown, PresignedFileRequest>, res: Response) => {
        const response = await this.adminService.generatePresignedUrls(req.body);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/admin/user/{idUser}/inactivate:
     *   put:
     *     tags: [Admin]
     *     summary: Inactiva la cuenta de un usuario
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idUser
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Usuario inactivado correctamente
     */
    this.router.put(
      '/user/:idUser/inactivate',
      ...protect,
      async (req: Request<{ idUser: string }>, res: Response) => {
        const response = await this.adminService.inactivateUser(Number(req.params.idUser));
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/admin/cupon:
     *   post:
     *     tags: [Admin]
     *     summary: Crea un cupon
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AdminCuponInput'
     *     responses:
     *       200:
     *         description: Cupon creado correctamente
     *   get:
     *     tags: [Admin]
     *     summary: Lista los cupones activos de forma paginada
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: pageNumber
     *         schema: { type: integer, default: 1 }
     *       - in: query
     *         name: pageSize
     *         schema: { type: integer, default: 20 }
     *     responses:
     *       200:
     *         description: Listado de cupones
     */
    this.router.post(
      '/cupon',
      ...protect,
      validateCupon,
      async (req: AuthenticatedTypedRequest<unknown, CreateCuponRequest>, res: Response) => {
        const response = await this.adminService.createCupon(req.body, req.auth!.idUser);
        res.status(200).json(response);
      },
    );

    this.router.get('/cupon', ...protect, async (req: Request, res: Response) => {
      const response = await this.adminService.getCupones({
        pageNumber: req.query.pageNumber ? Number(req.query.pageNumber) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      res.status(200).json(response);
    });

    /**
     * @openapi
     * /api/admin/cupon/{idCupon}:
     *   get:
     *     tags: [Admin]
     *     summary: Obtiene el detalle de un cupon
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idCupon
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Detalle del cupon
     *   put:
     *     tags: [Admin]
     *     summary: Actualiza un cupon
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idCupon
     *         required: true
     *         schema: { type: integer }
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AdminCuponInput'
     *     responses:
     *       200:
     *         description: Cupon actualizado correctamente
     *   delete:
     *     tags: [Admin]
     *     summary: Elimina (inactiva) un cupon
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idCupon
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Cupon eliminado correctamente
     */
    this.router.get(
      '/cupon/:idCupon',
      ...protect,
      async (req: Request<{ idCupon: string }>, res: Response) => {
        const response = await this.adminService.getCuponById(Number(req.params.idCupon));
        res.status(200).json(response);
      },
    );

    this.router.put(
      '/cupon/:idCupon',
      ...protect,
      validateCupon,
      async (req: AuthenticatedTypedRequest<{ idCupon: string }, UpdateCuponRequest>, res: Response) => {
        const response = await this.adminService.updateCupon(
          Number(req.params.idCupon),
          req.body,
          req.auth!.idUser,
        );
        res.status(200).json(response);
      },
    );

    this.router.delete(
      '/cupon/:idCupon',
      ...protect,
      async (req: AuthenticatedTypedRequest<{ idCupon: string }>, res: Response) => {
        const response = await this.adminService.deleteCupon(Number(req.params.idCupon), req.auth!.idUser);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/admin/product-type:
     *   post:
     *     tags: [Admin]
     *     summary: Crea un tipo de producto
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [productTypeName, productTypeDescription]
     *             properties:
     *               productTypeName: { type: string }
     *               productTypeDescription: { type: string }
     *     responses:
     *       200:
     *         description: Tipo de producto creado correctamente
     *   get:
     *     tags: [Admin]
     *     summary: Lista los tipos de producto activos
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Listado de tipos de producto
     */
    this.router.post(
      '/product-type',
      ...protect,
      validateProductType,
      async (req: Request<unknown, unknown, CreateProductTypeRequest>, res: Response) => {
        const response = await this.adminService.createProductType(req.body);
        res.status(200).json(response);
      },
    );

    this.router.get('/product-type', ...protect, async (_req: Request, res: Response) => {
      const response = await this.adminService.getProductTypes();
      res.status(200).json(response);
    });

    /**
     * @openapi
     * /api/admin/product-type/{idProductType}:
     *   get:
     *     tags: [Admin]
     *     summary: Obtiene el detalle de un tipo de producto
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idProductType
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Detalle del tipo de producto
     *   put:
     *     tags: [Admin]
     *     summary: Actualiza un tipo de producto
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idProductType
     *         required: true
     *         schema: { type: integer }
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [productTypeName, productTypeDescription]
     *             properties:
     *               productTypeName: { type: string }
     *               productTypeDescription: { type: string }
     *     responses:
     *       200:
     *         description: Tipo de producto actualizado correctamente
     *   delete:
     *     tags: [Admin]
     *     summary: Elimina (inactiva) un tipo de producto
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idProductType
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Tipo de producto eliminado correctamente
     */
    this.router.get(
      '/product-type/:idProductType',
      ...protect,
      async (req: Request<{ idProductType: string }>, res: Response) => {
        const response = await this.adminService.getProductTypeById(Number(req.params.idProductType));
        res.status(200).json(response);
      },
    );

    this.router.put(
      '/product-type/:idProductType',
      ...protect,
      validateProductType,
      async (req: Request<{ idProductType: string }, unknown, UpdateProductTypeRequest>, res: Response) => {
        const response = await this.adminService.updateProductType(
          Number(req.params.idProductType),
          req.body,
        );
        res.status(200).json(response);
      },
    );

    this.router.delete(
      '/product-type/:idProductType',
      ...protect,
      async (req: Request<{ idProductType: string }>, res: Response) => {
        const response = await this.adminService.deleteProductType(Number(req.params.idProductType));
        res.status(200).json(response);
      },
    );
  }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     AdminVariant:
 *       type: object
 *       required: [sku, price, quantity, isDefault, photos]
 *       properties:
 *         idVariant:
 *           type: integer
 *           description: Solo en actualizacion; omitir para crear una variante nueva
 *         sku: { type: string }
 *         size: { type: string, nullable: true }
 *         color: { type: string, nullable: true }
 *         features: { type: string, nullable: true }
 *         price: { type: number }
 *         quantity: { type: integer }
 *         isDefault: { type: boolean }
 *         photos:
 *           type: array
 *           items:
 *             type: object
 *             required: [fileName, s3BucketKey, fileContentType]
 *             properties:
 *               idFile:
 *                 type: integer
 *                 description: Solo en actualizacion; omitir para una fotografia nueva
 *               fileName: { type: string }
 *               s3BucketKey: { type: string }
 *               fileContentType: { type: string }
 *     AdminCuponInput:
 *       type: object
 *       required: [idCuponType, cuponCode, limitUseTotal, limitUsePerClient, cuponValue, cuponExpiration, isPerCategory]
 *       properties:
 *         idCuponType: { type: integer }
 *         cuponCode: { type: string }
 *         limitUseTotal: { type: integer }
 *         limitUsePerClient: { type: integer }
 *         cuponValue: { type: number }
 *         cuponExpiration: { type: string, format: date-time }
 *         isPerCategory: { type: boolean }
 *         categoryIds:
 *           type: array
 *           items: { type: integer }
 */
