# Challenge 360 — shopCart

Un sistema de comercio electronico ("carrito de compras") construido como challenge de programacion: una API REST en Express + TypeScript, respaldada por SQL Server, con dominios Admin / Operator / Client / Common, autenticacion JWT con un modelo de permisos a nivel de recurso, un worker en segundo plano y notificaciones de correo asincronas via AWS SQS; y una SPA en React + TypeScript que consume esa API, con sus propios layouts y rutas protegidas por rol (Admin / Operator / Client).

Este documento es la fuente unica de verdad sobre como esta construido el proyecto, por que esta construido de esa forma, y como configurarlo y ejecutarlo. Los contratos de request/response por endpoint viven en `backend/spect/*.md`; este README se enfoca en la arquitectura, la infraestructura y el razonamiento detras de ambas aplicaciones.

## Tabla de contenido

- [Estructura del proyecto](#estructura-del-proyecto)
- [Primeros pasos](#primeros-pasos)
- [API](#api)
  - [Estilo arquitectonico: Clean Architecture](#estilo-arquitectonico-clean-architecture)
  - [Capas](#capas)
  - [Ciclo de vida de una peticion](#ciclo-de-vida-de-una-peticion)
  - [Sobre estandar de respuesta](#sobre-estandar-de-respuesta)
  - [Autenticacion y autorizacion](#autenticacion-y-autorizacion)
  - [Cache de catalogos](#cache-de-catalogos)
  - [Worker en segundo plano](#worker-en-segundo-plano-shipmentworker)
  - [Notificaciones de correo asincronas (SQS + DLQ)](#notificaciones-de-correo-asincronas-sqs--dlq)
  - [Almacenamiento de archivos (URLs prefirmadas de S3)](#almacenamiento-de-archivos-urls-prefirmadas-de-s3)
  - [Configuracion y secretos](#configuracion-y-secretos)
  - [Documentacion de la API (Swagger)](#documentacion-de-la-api-swagger)
  - [Manejo de errores y codigos de error/exito](#manejo-de-errores-y-codigos-de-errorexito)
  - [Mapa de endpoints](#mapa-de-endpoints)
- [Frontend](#frontend)
  - [Stack y decisiones de build](#stack-y-decisiones-de-build)
  - [Capas](#capas-1)
  - [Ciclo de vida de una pantalla](#ciclo-de-vida-de-una-pantalla)
  - [Ruteo y como se protegen las rutas](#ruteo-y-como-se-protegen-las-rutas)
  - [Estado global y sesion](#estado-global-y-sesion)
  - [Cliente HTTP y rotacion de tokens](#cliente-http-y-rotacion-de-tokens)
  - [UI kit e iconos](#ui-kit-e-iconos)
  - [Configuracion](#configuracion-frontend)
- [Base de datos](#base-de-datos)

## Estructura del proyecto

```
challenge_360/
├── backend/            API en Express + TypeScript (documentada abajo)
│   ├── src/
│   ├── spect/          Especificaciones funcionales por feature, escritas antes/junto a la implementacion
│   ├── skills/         Reglas internas de construccion contra las que se implemento la API
│   └── database/       (conceptualmente enlazada a ../database, ver abajo)
├── database/           Esquema de SQL Server, scripts de correccion de drift y stored procedures
└── frontend/           SPA en React + TypeScript + Vite (documentada abajo)
    └── src/
        ├── app/         Composicion de la app: router, QueryClient, providers
        ├── routes/       Rutas de TanStack Router (file-based), una por archivo
        ├── layouts/      Shells por rol: AdminLayout, OperatorLayout, StorefrontLayout
        ├── pages/        Componentes de pantalla, puramente presentacionales
        ├── hooks/        Hooks de TanStack Query + hooks de orquestacion por pantalla, uno por dominio
        ├── services/     Clientes tipados de la API, uno por modulo del backend
        ├── store/        Estado global (reducer + Context), uno por slice: auth, cart
        ├── core/         http client, storage, config, types y utils transversales
        ├── components/   UI kit, layout parts, feedback e Icon registry
        └── styles/       SCSS global y tokens de diseño
```

Ambas aplicaciones son independientes en build y despliegue, pero comparten el mismo contrato: el frontend solo entiende la forma `StandardResponse` que expone la API (ver mas abajo).

## Primeros pasos

```bash
# Backend
cd backend
pnpm install
cp .env.example .env   # completa los valores descritos en "Configuracion y secretos" abajo
pnpm dev                # ts-node-dev, hot reload
# o
pnpm build && pnpm start
```

```bash
# Frontend
cd frontend
pnpm install
cp .env.example .env   # define VITE_API_URL apuntando al backend de arriba
pnpm dev                # Vite, hot reload en http://localhost:5173
# o
pnpm build && pnpm preview
```

La API necesita, como minimo, una instancia de SQL Server alcanzable (ver `database/`) y — para cualquier funcionalidad mas alla de un CRUD basico — un emulador local compatible con AWS ("floci", compatible con LocalStack) escuchando en `AWS_ENDPOINT_URL` para Secrets Manager, S3 y SQS. Todo en la API esta escrito para degradar de forma controlada cuando falta alguna de estas dependencias: el servidor igual arranca, y solo queda deshabilitada la funcionalidad dependiente (rutas respaldadas por DB, subida de archivos, notificaciones por correo) en lugar de hacer caer todo el proceso. El frontend no tiene dependencias de infraestructura propias: solo necesita que `VITE_API_URL` resuelva a una instancia de la API corriendo.

## API

### Estilo arquitectonico: Clean Architecture

La API fue construida deliberadamente con **Clean Architecture** en lugar del estilo "controlador gordo" o MVC clasico en el que suelen caer los proyectos de Express. Las razones:

- **La logica de negocio debe sobrevivir a cambios de infraestructura.** Este proyecto mueve datos a traves de SQL Server hoy, pero las reglas (como se reserva el inventario, como se calcula el descuento de un cupon, cuando expira una pre orden) son la parte valiosa y de larga vida del sistema — no la base de datos especifica, el ORM, ni siquiera que sea Express. Clean Architecture mantiene esa logica en `Core`/`Application`, aislada de `mssql`, `express`, `nodemailer` o el SDK de AWS.
- **Todos los modulos (Admin, Auth, Client, Operator, Common) siguen exactamente la misma forma de cuatro capas.** Esa consistencia es lo que hace que este codebase sea predecible de extender: agregar una funcionalidad nueva significa preguntar "cual es el DTO, cual es la logica de negocio, cual es la consulta, cual es la ruta" — en ese orden — en lugar de inventar un patron nuevo por funcionalidad.
- **Facilidad de pruebas.** Como los Helpers/Services dependen de interfaces y no de clases concretas, la logica de negocio (matematica de cupones, totales de factura, transiciones de estado) se puede probar de forma unitaria sin necesidad de una base de datos ni de un servidor HTTP.
- **Coincide con como se construye realmente el proyecto.** Cada funcionalidad nace como un spec en markdown dentro de `backend/spect/`, se implementa estrictamente siguiendo las reglas de capas en `backend/skills/`, y solo despues obtiene stored procedures y rutas. Clean Architecture es el unico estilo que mapea 1:1 sobre "spec → DTO/Core → regla de negocio/Application → consulta/Infrastructure → ruta/Presentation".

### Capas

```
Presentation  →  Application  →  Core
                      ↓
               Infrastructure  →  Core
```

Las dependencias siempre apuntan hacia adentro/abajo, hacia `Core`. `Core` no depende de nada.

| Capa | Carpeta | Responsabilidad | Puede depender de |
|---|---|---|---|
| **Core** | `src/Core` | Tipos de TypeScript, DTOs, interfaces (contratos) para cada Repository/Service/Helper, los diccionarios de error y exito, las excepciones personalizadas, y las plantillas HTML de correo. TypeScript puro, sin dependencias de frameworks. | nada |
| **Infrastructure** | `src/Infrastructure` | Repositories (las unicas clases autorizadas a tocar la base de datos, y solo a traves de stored procedures/funciones/vistas — nunca consultas directas a tablas), los clientes de AWS para S3/SecretsManager/SQS, el cliente SMTP de correo, y el `Settings` en tiempo de ejecucion (la implementacion de `ISettings` que lee el `.env`). | Core |
| **Application** | `src/Application` | Services (solo orquestacion — llaman a un Repository, llaman a un Helper, arman una respuesta, sin reglas de negocio) y Helpers (**toda la logica de negocio real**: matematica de cupones, totales de factura, planificacion de reserva de inventario, armado del payload de correo). Tambien el middleware de Express (auth, validacion, manejo de errores, CORS) y el `ShipmentWorker` en segundo plano. | Core, Infrastructure |
| **Presentation** | `src/Presentation` | Controladores/Routers de Express y el cableado de Swagger. Los controladores solo parsean la peticion, llaman a un Service, y hacen `res.status(200).json(...)` con el `StandardResponse`. Nunca contienen `try/catch` — toda excepcion sube al manejador de errores global (`express-async-errors` hace que los handlers `async` de las rutas puedan lanzar excepciones de forma segura). | Application, Core |

Cada uno de los cuatro dominios de negocio (Auth, Admin, Client, Operator) mas el modulo compartido Common repite exactamente esta misma forma: interfaces `I<Modulo>Repository` / `I<Modulo>Service` / `I<Modulo>Helper` en Core, una clase concreta por interfaz en la capa correspondiente, y un Controller que solo conoce la interfaz del Service — nunca la clase concreta. El cableado ocurre en un unico lugar, `src/CompositionRoot.ts`, que es el unico archivo del proyecto autorizado a instanciar (`new`) clases concretas de Application/Infrastructure y entregarselas unas a otras como interfaces. `src/index.ts` resuelve todo lo que necesita I/O al arrancar (pool de DB, credenciales de S3/SMTP/SQS desde Secrets Manager) y pasa los resultados a `CompositionRoot`.

**Por que los Services solo orquestan y los Helpers contienen la logica**, en lugar de una unica clase "Service" gorda por modulo: esto mantiene cada metodo de un Service legible como una historia lineal ("obtener los datos, pedirle al helper que haga el calculo, armar la respuesta"), mientras que cada decision real (¿este cupon sigue siendo valido? ¿cuanto impuesto aplica? ¿cual es el siguiente estado de envio?) vive en un unico lugar por concepto, que se puede leer y probar de forma independiente del HTTP o del SQL.

**Por que solo stored procedures, nunca consultas crudas desde la aplicacion:** cada decision a nivel de columna (indices, parseo de JSON via `OPENJSON`, transacciones, bloqueos) queda junto al esquema en `database/StoredProcedures`, y la capa Repository en TypeScript se reduce a "enlazar parametros, llamar a un procedure por nombre, mapear el recordset" — no existe una cadena SQL que se pueda concatenar por accidente, y un DBA puede revisar/optimizar un procedure sin tocar codigo de aplicacion.

### Ciclo de vida de una peticion

```
Peticion HTTP
  → middleware de CORS (buildCorsMiddleware, origenes permitidos desde .env)
  → express.json()
  → [solo rutas protegidas] validateSession (JWT: verifica/rota el par de tokens de acceso+refresco)
  → [solo rutas protegidas] validateRole (valida el/los rol(es) del llamante contra Resource/RoleResource para la ruta exacta)
  → [rutas con body] validationMiddleware (*Validators.ts por modulo — valida forma/campos requeridos, 400 si falla)
  → handler del Controller (parsea params/query/body, llama a un unico metodo de un Service, res.json(StandardResponse))
  → errorHandlerMiddleware (ultimo app.use — captura cualquier CustomException lanzada o Error inesperado)
```

Gracias a `express-async-errors`, un handler de Controller simplemente puede hacer `throw new CustomException(...)` (o dejar que un error del repository se propague) desde dentro de una funcion `async` — no existe ningun `next(error)` repetido en ningun Controller.

### Sobre estandar de respuesta

Cada endpoint — exitoso o fallido — retorna exactamente la misma forma, construida por `CommonHelper.buildResponse`:

```ts
interface StandardResponse<T> {
  success: boolean;
  message: string;            // legible por humanos, en espaniol, desde SuccessDictionary/ErrorDictionary
  statusCode: number;
  data: T | null;
  errorCode: string | null;   // p.ej. "CLI0002"
  errorMessage: string | Record<string, string> | null;
  traceID: string;            // UUID aleatorio, generado por respuesta, util para correlacionar logs
}
```

Un unico sobre predecible significa que el frontend nunca tiene que ramificar su logica de parseo por endpoint, y cada error es rastreable por `traceID` sin importar en que capa fue lanzado.

### Autenticacion y autorizacion

- **La autenticacion** se basa en JWT (`AuthHelper` firma/verifica, usando `jsonwebtoken`). El token de acceso tiene vida corta (`JWT_ACCESS_EXPIRES_IN_SECONDS`, por defecto 900s); el token de refresco tiene vida larga (`JWT_REFRESH_EXPIRES_IN_SECONDS`, por defecto 14 dias) y se persiste en la tabla `Session`. `buildValidateSessionMiddleware` verifica el token de acceso y, si expiro pero el token de refresco sigue siendo valido y activo, rota de forma transparente ambos tokens y adjunta el nuevo par al body de la respuesta bajo `data.refreshSession` — los clientes nunca necesitan llamar a un endpoint separado de "refresh".
- **La autorizacion no es un `if (role !== 'admin')` hardcodeado en ningun lugar del codigo.** Es dirigida por datos: `Resource` tiene una fila por cada ruta protegida (`ResourcePath`, guardado exactamente como el patron de ruta de Express, p.ej. `/api/client/pre-order/:idInvoice/item`), y `RoleResource` mapea roles a los recursos que tienen permitido llamar. `buildValidateRoleMiddleware` reconstruye el path del recurso a partir de `req.baseUrl + req.route.path` y le pregunta a `SP_Auth_ValidarPermisoRol` si el/los rol(es) del llamante estan vinculados a ese recurso. Agregar un endpoint protegido nuevo es entonces un proceso de dos pasos: escribir la ruta, e insertar una fila `Resource`/`RoleResource` en el schema del modulo correspondiente (ver el patron en `database/3.Admin_Schema.sql` y `database/4.Operator_Client_Schema.sql`) — nunca un cambio de codigo en la validacion de permisos en si.
- Las contrasenias se hashean con Argon2 (via `AuthHelper`), el salt lo maneja internamente la libreria.

### Cache de catalogos

Las tablas de consulta que se leen mucho y cambian poco (`CatProductType`, `CatCuponType`, `Role`, `CatShippmentStatus`, `CatShippmentMethod`, `CatReverseReason`) se cargan una sola vez en un snapshot en memoria (`CommonModuleHelper`) justo despues de que el pool de DB esta listo, y nuevamente cada vez que un Admin modifica alguna de ellas (`createProductType`, `updateCupon`, etc. llaman a `commonService.warmCatalogCache()`). `GET /api/common/catalog` lee unicamente desde ese snapshot — sin ida y vuelta a la base de datos por peticion.

Esto es intencionalmente un objeto plano en memoria, no Redis ni otro cache externo: el conjunto de datos es pequenio, se lee muchisimo mas de lo que cambia, un arranque en frio solo implica una consulta extra, y mantiene la huella de infraestructura del proyecto en "un SQL Server + un emulador compatible con AWS" en lugar de agregar una tercera dependencia con estado solo por un puniado de filas. El mismo razonamiento se extendio de forma natural al cache de notificaciones de envio descrito abajo, que reutiliza exactamente el mismo patron en memoria.

### Worker en segundo plano (`ShipmentWorker`)

`src/Application/Workers/ShipmentWorker.ts` se inicia una sola vez, desde `index.ts`, justo despues de que el pool de DB y el cache de catalogos estan listos, y es responsable de dos tareas independientes:

1. **Expiracion de pre ordenes.** Un carrito de compras ("pre orden") reserva inventario en el momento en que se agregan productos, de forma que un segundo cliente nunca pueda comprar las mismas unidades que estan en el carrito de otra persona. Si ese carrito se abandona, esas unidades deben regresar. Cada `PREORDER_WORKER_INTERVAL_MS` (por defecto **1000 ms**) el worker llama a `SP_Client_LiberarPreOrdenesExpiradas`, que busca toda factura que siga en estado `En pre orden` cuyo `LastItemAddedAt` sea mas antiguo que `PREORDER_EXPIRATION_MINUTES` (por defecto **15**) y, en una sola transaccion, restaura la cantidad reservada, registra la restauracion en `InventoryMove`, marca la factura y sus items como inactivos, y pasa la factura a estado `No transicionada`.
2. **Entrega de notificaciones de envio.** Hace long-polling sobre la cola SQS descrita abajo y, por cada mensaje, renderiza y envia el correo correspondiente.

**Por que un unico worker y no dos servicios separados:** ambas tareas son "tareas pequeñas y frecuentes en segundo plano para el mismo contexto acotado (envios)" y ambas necesitan las mismas dependencias (`ClientService`/`CommonModuleHelper`/`ISettings`). Correr las dos como un `setInterval` mas un loop de long-polling dentro del mismo proceso de la API que ya esta corriendo evita levantar y operar un segundo desplegable para lo que, a la escala de este proyecto, son unas pocas lineas de trabajo recurrente. Si en algun momento esto necesitara escalar de forma independiente o tener un ciclo de despliegue propio, `ShipmentWorker` ya esta lo suficientemente aislado (solo depende de interfaces) como para moverse a su propio proceso sin tocar ninguna otra capa.

El worker degrada de forma controlada: el loop de liberacion de pre ordenes solo necesita el pool de DB, asi que siempre corre una vez que la API tiene uno; el lado de SQS/correo simplemente se omite (con un log de advertencia) si la cola de notificaciones o las credenciales SMTP no estan configuradas en ese entorno.

### Notificaciones de correo asincronas (SQS + DLQ)

Cuando un Operador avanza el estado de un envio (`PATCH /api/operator/shippment-status`), la peticion **no** envia un correo de forma sincrona. En cambio:

1. `OperatorService` arma un payload de notificacion pequenio (destinatario, nombre, numero de factura, guia, nuevo estado) y lo publica como un mensaje JSON en una cola SQS (`SQS_QUEUE_NAME`).
2. `ShipmentWorker` es el unico consumidor: hace long-polling sobre la cola (`SQS_WAIT_TIME_SECONDS`), y por cada mensaje renderiza un correo HTML desde `Core/Templates/EmailTemplates.ts` y lo envia via SMTP de Gmail.
3. Solo despues de un envio exitoso se elimina el mensaje de la cola y se registra la notificacion en el cache en memoria (expuesto como `recentShipmentNotifications` en `GET /api/common/dashboard`).
4. Si el envio sigue fallando, SQS redirige el mensaje automaticamente; una vez que fue recibido `SQS_MAX_RECEIVE_COUNT` veces (por defecto 5) sin ser eliminado, SQS mismo lo mueve a la **cola de mensajes muertos (DLQ)** (`SQS_DLQ_NAME`) — no hizo falta escribir codigo de reintentos/backoff, queda resuelto enteramente por el `RedrivePolicy` de la cola.

**Por que una cola en lugar de enviar el correo directamente dentro de la peticion:** una llamada SMTP es lenta y ocasionalmente inestable (exactamente el tipo de dependencia externa que nunca deberia bloquear o hacer fallar la peticion de actualizacion de estado de un operador), y "enviar un correo" es naturalmente una operacion de disparar-y-olvidar, reintentable y de entrega al menos una vez — que es precisamente lo que SQS da gratis. Tambien significa que las plantillas de correo y el transporte SMTP real viven en un unico camino bien aislado (el worker), en lugar de duplicarse en cualquier otro lugar donde a futuro se necesite disparar una notificacion.

Tanto la cola como su DLQ se crean automaticamente al arrancar si todavia no existen (`SqsQueueService.ensureInfrastructure`, llamado desde `index.ts`), enlazando el ARN de la DLQ en el `RedrivePolicy` de la cola principal — de modo que un entorno local ("floci") recien creado se auto-aprovisiona sus propias colas la primera vez que arranca la API.

**Las plantillas HTML viven en `Core`, no en Infrastructure:** `buildShipmentStatusEmailHtml`/`buildShipmentStatusEmailSubject` son funciones puras, sin dependencias (constructores de strings HTML con estilos inline, con marca, con color segun el estado) — exactamente el tipo de logica libre de framework para la que existe `Core`. `Infrastructure/Email/SmtpEmailService` solo sabe como enviar un string HTML via SMTP; no tiene idea de que es un "estado de envio".

### Almacenamiento de archivos (URLs prefirmadas de S3)

Las subidas de Admin nunca pasan por el servidor de la API: `POST /api/admin/stored-file` retorna URLs PUT de S3 prefirmadas de corta duracion (`PRESIGNED_URL_EXPIRATION_SECONDS`, por defecto 900s), y el cliente sube los bytes del archivo directamente a S3. Esto mantiene la API sin estado y evita hacer de proxy de payloads binarios a traves de Node. `GET /api/common/file` lee un archivo almacenado de vuelta desde S3 por su bucket key para mostrarlo.

### Configuracion y secretos

Toda la configuracion en tiempo de ejecucion se lee una sola vez, al arrancar, en una unica implementacion de `ISettings` (`Infrastructure/Settings/Settings.ts`) y se inyecta en todo lo demas — ningun otro codigo fuera de ese archivo lee `process.env` directamente. La configuracion esta deliberadamente dividida en dos lugares, siguiendo una regla aplicada de forma consistente en todo el proyecto:

> **La configuracion no sensible (nombres, tamanios, timeouts, interruptores de funcionalidad) vive en `.env`. Las credenciales reales viven en AWS Secrets Manager**, resueltas una sola vez al arrancar usando una llave de AWS de arranque que en si misma solo tiene los privilegios necesarios para leer esos secretos especificos.

Por esto, por ejemplo, `SQS_QUEUE_NAME`/`SQS_DLQ_NAME` son valores planos de `.env` pero las credenciales IAM usadas para hablar con SQS se obtienen del secreto nombrado por `SECRET_SQS_CREDENTIALS_NAME`; la misma division aplica para la cadena de conexion de la base de datos, S3 y SMTP. El beneficio: rotar una credencial es una operacion de Secrets Manager sin necesidad de un deploy, `.env`/`.env.example` nunca corren el riesgo de filtrar un secreto real al control de versiones, y cada dependencia externa (DB, S3, SMTP, SQS) se resuelve a traves del mismo patron `secretsManager.getSecretString`/`getSecretJson` en `index.ts`, cada una con su propio manejo de fallo (`console.warn` + la funcionalidad se degrada, en lugar de tumbar todo el proceso) si ese secreto no esta presente en un entorno dado.

| Variable | Proposito | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP | `3000` |
| `NODE_ENV` | `development` \| `production` | `development` |
| `ALLOWED_ORIGINS` | Lista de origenes permitidos para CORS, separados por coma | _(vacio)_ |
| `JWT_SECRET` | Secreto de firma HMAC para los tokens de acceso/refresco | _(requerido)_ |
| `JWT_ACCESS_EXPIRES_IN_SECONDS` | Vida util del token de acceso | `900` |
| `JWT_REFRESH_EXPIRES_IN_SECONDS` | Vida util del token de refresco | `1209600` |
| `AWS_REGION` / `AWS_ENDPOINT_URL` | Region y endpoint del emulador ("floci"/LocalStack) para todos los clientes del SDK de AWS | `us-east-1` / _(vacio = AWS real)_ |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Credenciales de arranque — solo se usan para alcanzar Secrets Manager (y, para las operaciones propias del bucket, S3) | _(requerido)_ |
| `S3_BUCKET_NAME` | Bucket para fotos de producto y logos de metodos de envio | _(requerido)_ |
| `PRESIGNED_URL_EXPIRATION_SECONDS` | TTL de la URL de subida prefirmada | `900` |
| `SECRET_DB_CONNECTION_STRING_NAME` | Nombre del secreto en Secrets Manager → cadena de conexion a SQL Server | _(vacio = sin DB)_ |
| `SECRET_S3_CREDENTIALS_NAME` | Nombre del secreto en Secrets Manager → JSON `{accessKeyId, secretAccessKey, bucket, region}` | _(vacio = sin almacenamiento de archivos)_ |
| `SECRET_SMTP_CREDENTIALS_NAME` | Nombre del secreto en Secrets Manager → JSON `{host, port, user, pass, fromAddress, fromName}` (SMTP de Gmail) | _(vacio = sin correos)_ |
| `SECRET_SQS_CREDENTIALS_NAME` | Nombre del secreto en Secrets Manager → JSON `{accessKeyId, secretAccessKey, region}`, acotado solo a las dos colas de abajo | _(vacio = sin notificaciones)_ |
| `SQS_QUEUE_NAME` / `SQS_DLQ_NAME` | Cola de notificaciones de envio y su cola de mensajes muertos (se crean automaticamente al arrancar) | `shopcart-shipment-notifications(-dlq)` |
| `SQS_MAX_RECEIVE_COUNT` | Entregas permitidas antes de que un mensaje sea redirigido a la DLQ | `5` |
| `SQS_WAIT_TIME_SECONDS` | Tiempo de espera de long-polling por llamada a `ReceiveMessage` | `10` |
| `PREORDER_EXPIRATION_MINUTES` | Tiempo de inactividad antes de liberar una pre orden (carrito) | `15` |
| `PREORDER_WORKER_INTERVAL_MS` | Cada cuanto el worker busca pre ordenes expiradas | `1000` |
| `TAX_IVA_PERCENTAGE` | Porcentaje de IVA aplicado al subtotal de cada factura | `12` |

Los alias de rutas (`@Core`, `@Application`, `@Infrastructure`, `@Presentation`, cada uno resuelto contra `src/<Capa>/index.ts`) estan configurados en `tsconfig.json` y se reescriben en tiempo de build por `tsc-alias`, de forma que la regla de dependencias ("Infrastructure/Application solo pueden importar `@Core`, `@Infrastructure`, nunca entrar a los internos de otra capa") queda reforzada por como estan escritos los imports, no solo por convencion.

### Documentacion de la API (Swagger)

Cada ruta esta anotada con un bloque JSDoc `@openapi` justo encima de su registro en el Controller; `swagger-jsdoc` escanea `src/Presentation/Controllers/*.ts` al arrancar y sirve el spec generado, de forma interactiva, en `GET /swagger`.

### Manejo de errores y codigos de error/exito

`CustomException(statusCode, errorCode, errorMessage)` es la unica forma en que el codigo de aplicacion señala un error de negocio; se lanza desde un Service (luego de que un Repository rechaza con un mensaje `THROW` de SQL conocido, como `INSUFFICIENT_STOCK` o `CUPON_EXPIRED`) y se captura una unica vez, en `errorHandlerMiddleware`, que lo transforma al sobre estandar. Todos los codigos estan centralizados en `Core/Dictionaries/{ErrorDictionary,SuccessDictionary}.ts`, agrupados por prefijo de modulo (`AUTH*`, `ADM*`, `OP*`, `CLI*`, `VAL*`, `SYS0000` para cualquier cosa inesperada) — el prefijo por si solo indica que modulo lanzo el error.

### Mapa de endpoints

| Modulo | Metodo y ruta | Rol | Proposito |
|---|---|---|---|
| Auth | `POST /api/auth/account` | publico | Crear una cuenta de cliente |
| Auth | `POST /api/auth/account/privado` | Admin | Crear una cuenta con un rol explicito |
| Auth | `POST /api/auth/login` | publico | Iniciar sesion, retorna tokens de acceso y refresco |
| Admin | `POST`/`GET`/`PUT`/`DELETE /api/admin/product(/:idProduct)` | Admin | CRUD de productos + variantes + fotos |
| Admin | `POST /api/admin/stored-file` | Admin | URLs prefirmadas de subida a S3 |
| Admin | `PUT /api/admin/user/:idUser/inactivate` | Admin | Inactivar un usuario |
| Admin | `POST`/`GET`/`PUT`/`DELETE /api/admin/cupon(/:idCupon)` | Admin | CRUD de cupones |
| Admin | `POST`/`GET`/`PUT`/`DELETE /api/admin/product-type(/:idProductType)` | Admin | CRUD de tipos de producto |
| Common | `GET /api/common/product` | publico | Catalogo de productos paginado |
| Common | `GET /api/common/catalog` | cualquier rol autenticado | Tablas de catalogo en cache para el rol del llamante |
| Common | `GET /api/common/file` | publico | Lee un archivo almacenado desde S3 |
| Common | `GET /api/common/dashboard` | Admin, Operator | Metricas de envios + notificaciones recientes |
| Operator | `PATCH /api/operator/inventory` | Operator | Suma/resta inventario en lote por SKU |
| Operator | `PATCH /api/operator/shippment-status` | Operator | Avanza el estado de un envio, encola la notificacion |
| Operator | `GET /api/operator/shippment` | Operator | Listado paginado de envios confirmados |
| Client | `POST /api/client/pre-order` | Client | Crea un carrito, reservando inventario |
| Client | `POST /api/client/pre-order/:idInvoice/item` | Client | Agrega un producto a un carrito abierto |
| Client | `PATCH /api/client/shippment/:idInvoice` | Client | Confirma el checkout, aplica cupon, calcula totales |
| Client | `GET /api/client/invoice(/:idInvoice)` | Client | Listado/detalle de las facturas propias del cliente |

Los contratos completos de request/response, reglas de validacion y comportamiento de negocio por endpoint estan documentados en `backend/spect/spect_00001_AUHT_flows.md`, `spect_00002_Admin_flows.md` y `spect_00003_operator_client_flows.md`.

## Frontend

### Stack y decisiones de build

- **React 19 + TypeScript + Vite**, gestionado con `pnpm`. `oxlint` como linter (rapido, sin configuracion de ESLint que mantener) y Sass Modules (`*.module.scss`) para estilos con scope por componente — sin librerias de CSS-in-JS ni un framework de utilidades, para mantener el bundle y la curva de aprendizaje minimas.
- **TanStack Router** para ruteo file-based con code splitting automatico (`@tanstack/router-plugin/vite`, `autoCodeSplitting: true`) y **TanStack Query** para todo el estado de servidor (cache, reintentos, invalidacion). No hay Redux ni Zustand: el unico estado verdaderamente global y de cliente (sesion, carrito) vive en un store propio minimo (ver [Estado global y sesion](#estado-global-y-sesion)); todo lo demas es estado de servidor cacheado por Query o estado local de componente.
- **Alias por capa**, exactamente simetricos a los del backend (`@Core`/`@Application`/...): `@app`, `@core`, `@components`, `@hooks`, `@layouts`, `@pages`, `@services`, `@store`, `@styles`, `@assets`, definidos una sola vez en `vite.config.ts` (resolucion en runtime) y espejados en `tsconfig.app.json` (chequeo de tipos) — igual que los alias de capa del backend, esto hace que un import ilegal entre capas (p.ej. una `page` importando directo de `core/http` en vez de pasar por un `service`) sea visible en el import en si, no solo en una convencion documentada.

### Capas

```
routes  →  pages  →  hooks  →  services  →  core/http
   ↓          ↓         ↓
layouts   components  store
```

| Capa | Carpeta | Responsabilidad | Puede depender de |
|---|---|---|---|
| **core** | `src/core` | El `http` client (wrapper de `fetch`, unico lugar que arma requests), `storage` (envoltorio versionado sobre `localStorage`), `config/env` (unica lectura de `import.meta.env`), `types` (espejo de `StandardResponse`) y `utils` puros (JWT decode, formato de moneda/fecha, color, SKU, URLs de archivo). Sin JSX, sin dependencias de React. | nada |
| **services** | `src/services` | Un cliente tipado por modulo del backend (`auth`, `admin`, `operator`, `client`, `common`): funciones que llaman a `http.get/post/put/patch/delete` con la ruta exacta de la API y hacen `unwrapData` sobre el `StandardResponse`. Cero cache, cero estado — solo el contrato HTTP tipado. | core |
| **hooks** | `src/hooks` | Dos niveles, uno por archivo: `*.queries.ts`/`*.mutations.ts` (hooks finos de TanStack Query que llaman a un `service` y exponen cache keys en `*.keys.ts`), y `use<Page>Page.ts` (un hook por pantalla que compone una o mas queries/mutations, deriva estado y expone únicamente lo que la `page` necesita: datos, flags de carga/error, handlers). | services, store, core |
| **store** | `src/store` | Estado global de cliente, minimo a proposito: un slice `auth` (sesion/rol actual) y un slice `cart`. Cada slice se arma con la misma factory `createStore` (reducer + Context, ver abajo). | core |
| **pages** | `src/pages` | Componentes de pantalla, puramente presentacionales: reciben todo (datos, estado de carga, handlers) del hook `use<Page>Page` correspondiente y no llaman a `services` ni a `fetch` directamente. Separar esto del hook es lo que permite rediseñar una pantalla sin tocar su logica de datos, y probar la logica de datos sin montar JSX. | hooks, components |
| **layouts** | `src/layouts` | Un shell visual por rol/zona: `StorefrontLayout` (header publico, carrito), `AdminLayout`, `OperatorLayout` (sidebar + nav por rol). Renderizan `<Outlet />` de TanStack Router y el logout. | store, components |
| **routes** | `src/routes` | Definiciones de TanStack Router, deliberadamente delgadas: cada archivo solo arma un `createFileRoute(...)` con un `beforeLoad` (guard, si aplica) y un `component` importado de `pages`/`layouts`. Nunca contienen JSX propio mas alla de un wrapper trivial para leer params tipados. | pages, layouts, guards |
| **components** | `src/components` | El UI kit compartido (`Button`, `Input`, `Select`, `Table`, `Pagination`, `ProductGallery`, etc.), el registro de iconos (`Icon`, sobre `lucide-react`) y partes de layout/feedback reutilizables. | core |

**Por que un hook de pantalla (`use<Page>Page`) separado del componente de pantalla**, en vez de llamar `useQuery`/`useMutation` directo dentro del JSX: es el mismo razonamiento que separa Service de Helper en el backend — mantener cada pieza responsable de una sola cosa. El hook concentra toda la orquestacion de datos de una pantalla (que queries corren, como se derivan sus valores, que hace cada boton) en un unico lugar legible de arriba a abajo; la `page` se queda solo con marcado y estilos. Esto hace trivial reusar la misma pantalla con datos simulados en una historia/test, y que cambiar de TanStack Query a cualquier otra cosa en el futuro solo toque `hooks/`, nunca `pages/`.

### Ciclo de vida de una pantalla

```
Ruta (TanStack Router)
  → beforeLoad: guard de auth/rol (si la ruta lo requiere, ver abajo)
  → component: Layout (si es ruta padre) o Page (si es ruta hoja)
      → use<Page>Page()            // hook de orquestacion
          → useXQuery / useXMutation   // TanStack Query, cache por query key
              → xService.method()      // contrato HTTP tipado
                  → http.get/post/...  // fetch wrapper, inyecta Authorization + x-refresh-token
      ← { data, isLoading, isError, handlers }
  → JSX puramente presentacional, usando el UI kit de @components
```

Esto espeja a proposito el ciclo de vida de una peticion en el backend (routing → middleware → controller → service → repository): cada capa tiene una unica razon para cambiar, y los datos solo fluyen en una direccion (routes → pages → hooks → services → core).

### Ruteo y como se protegen las rutas

El ruteo usa **TanStack Router en modo file-based**: cada archivo en `src/routes/` es una ruta, con convenciones de nombre que codifican la jerarquia (`admin.products.$idProduct.tsx` → `/admin/products/:idProduct`, el prefijo `_` marca una ruta "pathless" que solo aporta layout sin segmento de URL — `_storefront.tsx` —, y el prefijo `-` marca un archivo que **no** es una ruta, como `-guards.ts`). El plugin de Vite (`@tanstack/router-plugin`) observa esta carpeta y regenera `src/routeTree.gen.ts` automaticamente — ese archivo nunca se edita a mano, es equivalente al `routeTree` compilado que consume `createRouter` en `app/router.ts`.

La proteccion de rutas **no vive dentro de los componentes de pagina**, vive declarada en la propia definicion de ruta, en el hook `beforeLoad` que TanStack Router corre antes de montar cualquier componente:

```ts
// src/routes/-guards.ts
export function requireAuth(): void {
  if (!getAuthSnapshot().isAuthenticated) throw redirect({ to: '/login' });
}

export function requireRole(role: string): () => void {
  return () => {
    const snapshot = getAuthSnapshot();
    if (!snapshot.isAuthenticated) throw redirect({ to: '/login' });
    if (!snapshot.roles.includes(role)) throw redirect({ to: '/' });
  };
}
```

Esto se aplica en dos niveles distintos, segun si la proteccion aplica a una zona entera o a una pantalla puntual:

- **Por rol, a nivel de layout padre.** `/admin` y `/operator` son rutas padre (`routes/admin.tsx`, `routes/operator.tsx`) cuyo `beforeLoad` es `requireRole('ADPRU')` / `requireRole('OPPRU')` respectivamente (los codigos de rol vienen directo de `Role.RolePublicCode` en la base de datos, el mismo valor que el backend guarda en el JWT). TanStack Router corre el `beforeLoad` de cada ancestro antes del de la ruta hija, de la raiz hacia abajo — asi que **toda** ruta bajo `/admin/*` (`products`, `cupons`, `users`, `product-types`, ...) queda protegida una sola vez, en el layout, sin repetir el guard en cada pantalla hija. Es deliberadamente el mismo modelo que la tabla `RoleResource` del backend: declarar el permiso una vez en el nodo correcto del arbol en lugar de un `if` repetido por endpoint/pantalla.
- **Por sesion, a nivel de pantalla puntual.** Dentro de la zona publica (`_storefront`, sin guard propio — Home, login, registro, detalle de producto son publicos), las pantallas que si requieren estar logueado (`orders`, `checkout`) declaran `requireAuth` en su propio `beforeLoad`, porque no comparten un ancestro protegido con el resto del storefront publico.

Un `beforeLoad` corre fuera del arbol de React (es parte de la resolucion de la ruta, antes de cualquier render), por lo que los guards **no pueden usar el hook `useAuth`**; en cambio leen el estado de sesion de forma sincrona con `getAuthSnapshot()`, que lee directo de `localStorage` (ver abajo). Esto es intencional: la primera pintura de una ruta protegida nunca llega a mostrar contenido restringido ni un parpadeo de "cargando" antes de redirigir — el `redirect()` ocurre antes de que exista cualquier componente que pintar.

### Estado global y sesion

Todo el estado de cliente (no de servidor) se arma con una unica factory, `createStore` (`src/store/createStore.tsx`): un `reducer` + dos `Context` de React (uno para el estado, uno para el `dispatch`), hidratado una vez al montar desde `storage` (el envoltorio versionado sobre `localStorage`) y persistido de vuelta en cada cambio via `useEffect`. Los dos slices reales (`auth`, `cart`) son instancias delgadas de esa misma factory — no hay logica de persistencia duplicada entre ellos.

**El detalle que conecta el store de React con los guards fuera de React:** el slice `auth` persiste bajo la misma clave versionada de `localStorage` (`app:auth`, v1) que usa `core/http/authSession.ts` para leer/escribir el token de acceso y refresco que el cliente HTTP adjunta a cada peticion. En la practica, `localStorage` es la unica fuente de verdad para la sesion; el `useAuth()` hook (estado reactivo, para renderizar) y `getAuthSnapshot()` (lectura sincrona, para los guards de rutas) son simplemente dos formas de leer el mismo dato segun si el llamador esta dentro del arbol de React o no. Esto evita el problema clasico de "el guard de ruta ve una sesion desactualizada porque vive en un store de React distinto al que acaba de hacer login".

El rol del usuario nunca se guarda "a mano": al hacer login o registro, el frontend decodifica el `accessToken` (JWT) con `decodeJwtPayload` y toma `roles` directo de sus claims — los mismos roles que el backend ya valido y firmo, nunca una copia separada que se pueda desincronizar.

### Cliente HTTP y rotacion de tokens

`core/http/httpClient.ts` es el unico lugar del frontend que llama a `fetch`. Por cada peticion:

1. Lee la sesion persistida (`readAuthSession`) y, si existe, agrega `Authorization: Bearer <accessToken>` **y** `x-refresh-token: <refreshToken>` — el backend espera ambos para poder rotar el par de tokens de forma transparente si el de acceso ya expiro (ver [Autenticacion y autorizacion](#autenticacion-y-autorizacion) en la API).
2. Si la respuesta trae `data.refreshSession` (el backend solo la incluye cuando efectivamente roto los tokens), el cliente escribe el nuevo par de vuelta en `localStorage` de inmediato — sin que ningun componente ni hook tenga que saber que eso paso. Ningun endpoint de "refresh" separado se llama nunca desde el frontend.
3. Una respuesta no-OK se convierte siempre en una unica clase, `ApiError` (status, `errorCode`, y `fieldErrors` si `errorMessage` del `StandardResponse` vino como objeto) — los `hooks` de mutacion/query solo necesitan capturar ese unico tipo para mostrar un error de validacion por campo o un mensaje generico, nunca ramificar por forma de respuesta.

Esto significa que absolutamente ningun `service` ni `hook` sabe que existe un token de refresco: el manejo completo de sesion vive encapsulado en `core/http` + `core/storage`.

### UI kit e iconos

`src/components/ui` es un kit pequeño y propio (`Button`, `Input`, `Select`, `Checkbox`, `Stepper`, `Badge`, `Chip`, `Avatar`, `Spinner`, `Table`, `Pagination`, `Textarea`, `ColorPicker`, `ProductImage`/`ProductGallery`, etc.), sin dependencia de una libreria de componentes externa — cada uno es un componente + su `*.module.scss`. Los iconos pasan por un unico registro (`components/Icon/iconRegistry.ts`) que mapea nombres de string estables (`'shopping-bag'`, `'log-out'`, `'package'`, ...) a los iconos reales de `lucide-react`; el resto de la app importa `<Icon name="..." />`, nunca un icono de `lucide-react` directamente. Eso mantiene el set de iconos realmente usado auditable en un solo archivo y hace trivial cambiar de libreria de iconos sin tocar ningun componente de pantalla.

### Configuracion frontend

Igual que el backend concentra toda lectura de `process.env` en una unica implementacion de `ISettings`, el frontend concentra toda lectura de `import.meta.env` en `core/config/env.ts` — el resto del codigo importa `env`, nunca `import.meta.env` directamente.

| Variable | Proposito | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | Base URL de la API contra la que corre el cliente HTTP | _(requerido)_ |

## Base de datos

```mermaid
erDiagram
    userSystem {
        int IDUser PK
        varchar(200) UserFirstName
        varchar(200) UserLastName
        varchar(300) UserPassword
        varchar(150) UserEmail
        Datetime UserBirthday
        bit isUserActive
    }

    SystemEntity {
        int IDSystem PK
        varchar(100) SystemName
        varchar(400) SystemDescription
        varchar(50) SystemPublicCode
    }

    Session {
        int IDSession PK
        int IDUser FK
        varchar(150) SessionRefreshToken
        Datetime SessionRefreshTokenExpire
        bit SessionIsActive
    }

    Role {
        int IDRole PK
        int IDSystem FK
        varchar(100) RoleName
        varchar(400) RoleDescription
        varchar(50) RolePublicCode
    }

    UserRole {
        int IDUser PK,FK
        int IDRole PK,FK
    }

    CatResourceType {
        int IDResourceType PK
        varchar(100) ResourceTypeName
        varchar(400) ResourceTypeDescription
    }

    Resource {
        int IDResource PK
        varchar(100) ResourceName
        varchar(400) ResourceDescription
        int IDResourceType FK
        varchar(200) ResourcePath
        varchar(100) ResourceIcon
        varchar(150) ResourceComponent
        int IDResourceParent FK
    }

    RoleResource {
        int IDRole PK,FK
        int IDResource PK,FK
    }

    CatProductType {
        int IDProductType PK
        varchar(100) ProductTypeName
        varchar(400) ProductTypeDescription
        bit rowStatus
    }

    Product {
        int IDProduct PK
        int IDProductType FK
        varchar(100) ProductName
        varchar(600) ProductDescription
        int ProductUserCreatedBy FK
        Datetime ProductUserCreatedAt
        int ProductUserUpdatedBy FK
        Datetime ProductUserUpdatedAt
        varchar(50) ProductPublicCode
        bit rowStatus
    }

    ProductVariant {
        int IDVariant PK
        int IDProduct FK
        varchar(100) SKU
        varchar(50) Size
        varchar(100) Color
        varchar(400) Features
        decimal(18_2) Price
        int Quantity
        bit isDefault
        bit rowStatus
        int VariantUserCreatedBy FK
        Datetime VariantUserCreatedAt
        int VariantUserUpdatedBy FK
        Datetime VariantUserUpdatedAt
    }

    StoredFile {
        int IDFile PK
        int IDProductVariant FK
        varchar(50) FileName
        varchar(200) FileBucketKey
        varchar(100) FileContentType
        int FileUserCreatedBy FK
        Datetime FileUserCreatedAt
        int FileUserUpdatedBy FK
        Datetime FileUserUpdatedAt
    }

    InventoryMove {
        int IDMove PK
        int IDUserMove FK
        int IDProductVariant FK
        int Quantity
        varchar(20) moveType
        Datetime MoveCreatedAt
    }

    CatShippmentStatus {
        int IDShippmentStatus PK
        varchar(100) ShippmentStatusName
        varchar(400) ShipmentStatusDescription
    }

    CatShippmentMethod {
        int IDShipmmentMethod PK
        varchar(100) ShippmentMethodCompanyName
        varchar(400) ShippmentMethodDescription
        decimal(18_2) ShipmentPrice
        varchar(200) ShipmentLogoCompanyBucketKey
    }

    CatCuponType {
        int IDCuponType PK
        varchar(100) CuponTypeName
        varchar(400) CuponTypeDescription
    }

    Cupon {
        int IDCupon PK
        int IDCuponType FK
        varchar(100) CuponCode
        int limitUseTotal
        int limitUsePerClient
        decimal(18_2) CuponValue
        Datetime CuponExpiration
        bit isPerCategory
        bit rowStatus
        int CuponUserCreatedBy FK
        Datetime CuponUserCreatedAt
        int CuponUserUpdatedBy FK
        Datetime CuponUserUpdatedAt
    }

    CuponPerCategory {
        int IDCupon PK,FK
        int IDProductType PK,FK
    }

    CatReverseReason {
        int IDReverseReason PK
        varchar(100) ReverseReasonName
        varchar(400) ReverseReasonDescription
    }

    Invoice {
        int IDInvoice PK
        int IDUser FK
        varchar(900) InvoiceNumber
        varchar(300) AddressLine1
        varchar(300) AddressLine2
        Datetime InvoiceDate
        varchar(50) DocumentNumber
        varchar(70) ShippmentGuide
        int IDShipmentStatus FK
        int IDShippmmentMethod FK
        int IDCuponApplied FK
        bit isPayVDelivered
        bit isReversed
        varchar(200) ReversedNotes
        int InvoiceUserUpdatedBy FK
        Datetime InvoiceUserUpdatedAt
        bit rowStatus
        Datetime LastItemAddedAt
    }

    InvoiceItem {
        int IDInvoiceItem PK
        int IDInvoice FK
        int IDProductVariant FK
        int Quantity
        decimal(18_2) PriceShiped
        bit isReversed
        int IDReverseReason FK
        bit rowStatus
    }

    %% Seguridad
    userSystem ||--o{ Session : "Posee"
    SystemEntity ||--o{ Role : "Define"
    userSystem ||--o{ UserRole : "Tiene"
    Role ||--o{ UserRole : "Asignado_a"
    CatResourceType ||--o{ Resource : "Clasifica"
    Resource |o--o{ Resource : "Padre_de"
    Role ||--o{ RoleResource : "Tiene"
    Resource ||--o{ RoleResource : "Permitido_en"

    %% Catalogo e inventario
    CatProductType ||--o{ Product : "Categoriza"
    Product ||--o{ ProductVariant : "Contiene"
    ProductVariant ||--o{ StoredFile : "Adjunta"
    ProductVariant ||--o{ InventoryMove : "Registra_movimiento"
    userSystem ||--o{ InventoryMove : "Audita_movimiento"

    %% Cupones
    CatCuponType ||--o{ Cupon : "Define_tipo"
    Cupon ||--o{ CuponPerCategory : "Restringe"
    CatProductType ||--o{ CuponPerCategory : "Aplica"

    %% Ventas y facturacion
    userSystem ||--o{ Invoice : "Compra"
    CatShippmentStatus ||--o{ Invoice : "Estado"
    CatShippmentMethod ||--o{ Invoice : "Transporta"
    Cupon |o--o{ Invoice : "Descuenta"
    Invoice ||--o{ InvoiceItem : "Detalla"
    ProductVariant ||--o{ InvoiceItem : "Vendido_como"
    CatReverseReason |o--o{ InvoiceItem : "Motivo_Reversa"

    %% Auditoria
    userSystem ||--o{ Product : "Audita_Creacion_Edicion"
    userSystem ||--o{ ProductVariant : "Audita_Creacion_Edicion"
    userSystem ||--o{ StoredFile : "Audita_Creacion_Edicion"
    userSystem ||--o{ Cupon : "Audita_Creacion_Edicion"
    userSystem ||--o{ Invoice : "Audita_Edicion"
```
