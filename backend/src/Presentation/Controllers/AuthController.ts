import { Request, Response, Router } from 'express';
import { CreateAccountRequest, CreateAccountWithRoleRequest, IAuthService, LoginRequest } from '@Core';
import { buildValidateRoleMiddleware, buildValidateSessionMiddleware } from '@Application';

const PUBLIC_ROLE_CODE = 'RCPU';

export class AuthController {
  public readonly router: Router;

  constructor(private readonly authService: IAuthService) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    const validateSession = buildValidateSessionMiddleware(this.authService);
    const validateRole = buildValidateRoleMiddleware(this.authService);

    /**
     * @openapi
     * /api/auth/account:
     *   post:
     *     tags: [Auth]
     *     summary: Crea una cuenta publica (rol cliente asignado automaticamente)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [userFirstName, userLastName, userPassword, userEmail, userBirthday]
     *             properties:
     *               userFirstName: { type: string }
     *               userLastName: { type: string }
     *               userPassword: { type: string }
     *               userEmail: { type: string }
     *               userBirthday: { type: string, format: date }
     *     responses:
     *       200:
     *         description: Cuenta creada con exito
     */
    this.router.post(
      '/account',
      async (req: Request<unknown, unknown, CreateAccountRequest>, res: Response) => {
        const response = await this.authService.createAccount(req.body, PUBLIC_ROLE_CODE);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/auth/account/privado:
     *   post:
     *     tags: [Auth]
     *     summary: Crea una cuenta asignando un rol especifico (requiere sesion y permiso de administracion)
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [userFirstName, userLastName, userPassword, userEmail, userBirthday, rolePublicCode]
     *             properties:
     *               userFirstName: { type: string }
     *               userLastName: { type: string }
     *               userPassword: { type: string }
     *               userEmail: { type: string }
     *               userBirthday: { type: string, format: date }
     *               rolePublicCode: { type: string }
     *     responses:
     *       200:
     *         description: Cuenta creada con exito
     */
    this.router.post(
      '/account/privado',
      validateSession,
      validateRole,
      async (req: Request<unknown, unknown, CreateAccountWithRoleRequest>, res: Response) => {
        const { rolePublicCode, ...accountData } = req.body;
        const response = await this.authService.createAccount(accountData, rolePublicCode);
        res.status(200).json(response);
      },
    );

    /**
     * @openapi
     * /api/auth/login:
     *   post:
     *     tags: [Auth]
     *     summary: Inicia sesion y retorna accessToken/refreshToken
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [userEmail, userPassword]
     *             properties:
     *               userEmail: { type: string }
     *               userPassword: { type: string }
     *     responses:
     *       200:
     *         description: Sesion iniciada con exito
     */
    this.router.post(
      '/login',
      async (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
        const response = await this.authService.login(req.body);
        res.status(200).json(response);
      },
    );
  }
}
