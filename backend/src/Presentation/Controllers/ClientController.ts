import { Request, Response, Router } from 'express';
import {
  AddPreOrderItemRequest,
  ConfirmShipmentRequest,
  CreatePreOrderRequest,
  IAuthService,
  IClientService,
} from '@Core';
import {
  AuthenticatedTypedRequest,
  buildValidateRoleMiddleware,
  buildValidateSessionMiddleware,
  buildValidationMiddleware,
  validateAddPreOrderItemRequest,
  validateConfirmShipmentRequest,
  validateCreatePreOrderRequest,
} from '@Application';

export class ClientController {
  public readonly router: Router;

  constructor(
    private readonly clientService: IClientService,
    private readonly authService: IAuthService,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    const validateSession = buildValidateSessionMiddleware(this.authService);
    const validateRole = buildValidateRoleMiddleware(this.authService);
    const protect = [validateSession, validateRole];

    const validateCreatePreOrder = buildValidationMiddleware(validateCreatePreOrderRequest);
    const validateAddPreOrderItem = buildValidationMiddleware(validateAddPreOrderItemRequest);
    const validateConfirmShipment = buildValidationMiddleware(validateConfirmShipmentRequest);

    /**
     * @openapi
     * /api/client/pre-order:
     *   post:
     *     tags: [Client]
     *     summary: Crea una pre orden (carrito) reservando inventario de forma temporal
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [idShippmentMethod, addressLine1, items]
     *             properties:
     *               idShippmentMethod: { type: integer }
     *               addressLine1: { type: string }
     *               addressLine2: { type: string, nullable: true }
     *               items:
     *                 type: array
     *                 items:
     *                   type: object
     *                   required: [idProductVariant, quantity]
     *                   properties:
     *                     idProductVariant: { type: integer }
     *                     quantity: { type: integer }
     *     responses:
     *       200:
     *         description: Pre orden creada correctamente
     */
    this.router.post(
      '/pre-order',
      ...protect,
      validateCreatePreOrder,
      async (req: AuthenticatedTypedRequest<unknown, CreatePreOrderRequest>, res: Response) => {
        const response = await this.clientService.createPreOrder(req.auth!.idUser, req.body);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/client/pre-order/{idInvoice}/item:
     *   post:
     *     tags: [Client]
     *     summary: Agrega un producto a una pre orden existente (reinicia el tiempo de expiracion)
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idInvoice
     *         required: true
     *         schema: { type: integer }
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [idProductVariant, quantity]
     *             properties:
     *               idProductVariant: { type: integer }
     *               quantity: { type: integer }
     *     responses:
     *       200:
     *         description: Producto agregado a la pre orden correctamente
     */
    this.router.post(
      '/pre-order/:idInvoice/item',
      ...protect,
      validateAddPreOrderItem,
      async (req: AuthenticatedTypedRequest<{ idInvoice: string }, AddPreOrderItemRequest>, res: Response) => {
        const response = await this.clientService.addPreOrderItem(
          req.auth!.idUser,
          Number(req.params.idInvoice),
          req.body,
        );
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/client/shippment/{idInvoice}:
     *   patch:
     *     tags: [Client]
     *     summary: Confirma una pre orden como envio, aplicando cupon si corresponde, y calcula el total a pagar
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idInvoice
     *         required: true
     *         schema: { type: integer }
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               cuponCode: { type: string, nullable: true }
     *     responses:
     *       200:
     *         description: Envio confirmado correctamente
     */
    this.router.patch(
      '/shippment/:idInvoice',
      ...protect,
      validateConfirmShipment,
      async (req: AuthenticatedTypedRequest<{ idInvoice: string }, ConfirmShipmentRequest>, res: Response) => {
        const response = await this.clientService.confirmShipment(
          req.auth!.idUser,
          Number(req.params.idInvoice),
          req.body ?? {},
        );
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/client/invoice:
     *   get:
     *     tags: [Client]
     *     summary: Lista de forma paginada las facturas propias del cliente autenticado, incluyendo totales calculados
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: pageNumber
     *         schema: { type: integer, default: 1 }
     *       - in: query
     *         name: pageSize
     *         schema: { type: integer, default: 20 }
     *       - in: query
     *         name: idShipmentStatus
     *         schema: { type: integer }
     *       - in: query
     *         name: from
     *         schema: { type: string, format: date-time }
     *       - in: query
     *         name: to
     *         schema: { type: string, format: date-time }
     *     responses:
     *       200:
     *         description: Listado paginado de facturas propias
     */
    this.router.get(
      '/invoice',
      ...protect,
      async (req: AuthenticatedTypedRequest, res: Response) => {
        const response = await this.clientService.getInvoices(req.auth!.idUser, {
          pageNumber: req.query.pageNumber ? Number(req.query.pageNumber) : undefined,
          pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
          idShipmentStatus: req.query.idShipmentStatus ? Number(req.query.idShipmentStatus) : undefined,
          from: typeof req.query.from === 'string' ? req.query.from : undefined,
          to: typeof req.query.to === 'string' ? req.query.to : undefined,
        });
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/client/invoice/{idInvoice}:
     *   get:
     *     tags: [Client]
     *     summary: Obtiene el detalle de una factura propia, incluyendo items, impuestos, cupon y totales
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: idInvoice
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Detalle de la factura
     */
    this.router.get(
      '/invoice/:idInvoice',
      ...protect,
      async (req: AuthenticatedTypedRequest<{ idInvoice: string }>, res: Response) => {
        const response = await this.clientService.getInvoiceDetail(req.auth!.idUser, Number(req.params.idInvoice));
        res.status(200).json(response);
      },
    );
  }
}
