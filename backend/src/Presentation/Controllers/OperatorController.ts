import { Request, Response, Router } from 'express';
import { AdjustInventoryRequest, IAuthService, IOperatorService, UpdateShipmentStatusRequest } from '@Core';
import {
  AuthenticatedTypedRequest,
  buildValidateRoleMiddleware,
  buildValidateSessionMiddleware,
  buildValidationMiddleware,
  validateAdjustInventoryRequest,
  validateUpdateShipmentStatusRequest,
} from '@Application';

export class OperatorController {
  public readonly router: Router;

  constructor(
    private readonly operatorService: IOperatorService,
    private readonly authService: IAuthService,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    const validateSession = buildValidateSessionMiddleware(this.authService);
    const validateRole = buildValidateRoleMiddleware(this.authService);
    const protect = [validateSession, validateRole];

    const validateAdjustInventory = buildValidationMiddleware(validateAdjustInventoryRequest);
    const validateUpdateShipmentStatus = buildValidationMiddleware(validateUpdateShipmentStatusRequest);

    /**
     * @openapi
     * /api/operator/inventory:
     *   patch:
     *     tags: [Operator]
     *     summary: Suma o resta cantidades de inventario por SKU
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [inventory]
     *             properties:
     *               inventory:
     *                 type: array
     *                 items:
     *                   type: object
     *                   required: [idProductVariant, quantityToAdd, type]
     *                   properties:
     *                     idProductVariant:
     *                       type: string
     *                       description: SKU de la variante
     *                     quantityToAdd: { type: integer }
     *                     type: { type: string, enum: [sumar, restar] }
     *     responses:
     *       200:
     *         description: Se agrego correctamente a inventario
     */
    this.router.patch(
      '/inventory',
      ...protect,
      validateAdjustInventory,
      async (req: AuthenticatedTypedRequest<unknown, AdjustInventoryRequest>, res: Response) => {
        const response = await this.operatorService.adjustInventory(req.auth!.idUser, req.body);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/operator/shippment-status:
     *   patch:
     *     tags: [Operator]
     *     summary: Transiciona el estado de envio de una factura y asigna la guia de envio
     *     description: >
     *       "A la espera de guia" -> "Entregado a servicio delivery" (requiere deliveryGuide),
     *       luego "Entregado a servicio delivery" -> "Entregado al cliente final" (deliveryGuide ya no es requerido).
     *       Envia una notificacion por correo via SQS en cada transicion.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [invoiceNumber]
     *             properties:
     *               invoiceNumber: { type: string }
     *               deliveryGuide: { type: string }
     *     responses:
     *       200:
     *         description: Estado de envio actualizado correctamente
     */
    this.router.patch(
      '/shippment-status',
      ...protect,
      validateUpdateShipmentStatus,
      async (req: Request<unknown, unknown, UpdateShipmentStatusRequest>, res: Response) => {
        const response = await this.operatorService.updateShipmentStatus(req.body);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/operator/shippment:
     *   get:
     *     tags: [Operator]
     *     summary: Lista de forma paginada los envios confirmados (excluye pre orden y no transicionados)
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
     *         name: from
     *         schema: { type: string, format: date-time }
     *       - in: query
     *         name: to
     *         schema: { type: string, format: date-time }
     *       - in: query
     *         name: idShipmentStatus
     *         schema: { type: integer }
     *       - in: query
     *         name: idShippmentMethod
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Listado paginado de envios
     */
    this.router.get('/shippment', ...protect, async (req: Request, res: Response) => {
      const response = await this.operatorService.getShipments({
        pageNumber: req.query.pageNumber ? Number(req.query.pageNumber) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        from: typeof req.query.from === 'string' ? req.query.from : undefined,
        to: typeof req.query.to === 'string' ? req.query.to : undefined,
        idShipmentStatus: req.query.idShipmentStatus ? Number(req.query.idShipmentStatus) : undefined,
        idShippmentMethod: req.query.idShippmentMethod ? Number(req.query.idShippmentMethod) : undefined,
      });
      res.status(200).json(response);
    });
  }
}
