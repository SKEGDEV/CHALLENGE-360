# FLOWS FOR OPERATOR AND CLIENT

---

## ENDPOINT TO ADD TO INVENTORY

### ENDPOINT INFO

* path: /api/operator/inventory
* method: PATCH
* request json

```json
// add to inventory DTO
{
  "idProductVariant": "string",
  "quantityToAdd": "string",
  "type": "string --> sumar || restar"
}

//request DTO

{
  "inventory": "addInventoryDTO[]"
}
```

* response message with data: null is "Se agrego correctamente a inventario"

### ENDPOINT BEHAVIOR

* Should add for product variant quantity if type is sumar else should substrain quantity from current quantity but if is > than current should throw an exception to indicates next: OP0001: "No se puede quitar la cantidad indicada del producto por que no se pueden quedar con inventario negativo"
* Also should insert a new register per movement into **InventoryMove** (IDUserMove, IDProductVariant, Quantity, moveType ENTRADA/SALIDA) extracting idUser from JWT. The original wording mentioned "InvoiceItem", but that table belongs to invoices/orders and has no column to represent a standalone stock movement (type, quantity only) — InventoryMove is the table the ERD already includes for exactly this purpose, so movements are recorded there instead.
* `idProductVariant` identifies the variant by its **SKU** (string), not by the internal numeric IDVariant, since the DTO types it as a string and SKU is the stable external identifier for a variant.
* The whole `inventory` array is processed inside a single DB transaction: if any line would leave a variant with negative stock, the entire batch is rolled back (no partial adjustments) and OP0001 is thrown.

### ENDPOINT RESTRICTIONS

* Only the Operator role (OPPRU) can call this endpoint.
* Every `idProductVariant` (SKU) must exist and be active (rowStatus = 1), otherwise OP0004 ("La variante de producto indicada no existe o se encuentra inactiva") is thrown.
* `quantityToAdd` must be a positive integer.
* `type` must be exactly `sumar` or `restar`.

## ENDPOINT TO MOVE SHIPMENT STATUS

### ENDPOINT INFO

* path: /api/operator/shippment-status
* method: PATCH
* request json

```json
{
  "invoiceNumber": "string",
  "deliveryGuide": "string"
}
```

* response message with data: null is "Estado de envio actualizado correctamente"

### ENDPOINT BEHAVIOR

* The invoice is looked up by `invoiceNumber` (must exist and be active, otherwise OP0002).
* The status only moves forward one step per call, following the shipment pipeline:
  * `A la espera de guia` -> `Entregado a servicio delivery`: requires `deliveryGuide` (non empty), which is saved into `Invoice.ShippmentGuide`.
  * `Entregado a servicio delivery` -> `Entregado al cliente final`: `deliveryGuide` is no longer required (it is kept from the previous step); `isPayVDelivered` is set to true.
  * Any other current status (pre orden, no transicionada, entregado al cliente final, devolucion) is not a valid starting point for this endpoint and throws OP0003.
  * If the guide is required and missing, OP0005 is thrown.
* On every successful transition, a shipment notification message (destination email, name, invoice number, guide, new status name) is published to an **SQS queue** instead of being emailed synchronously. The same worker described below consumes that queue, renders an HTML email (template lives in `Core/Templates/EmailTemplates.ts`) and sends it through the configured Gmail SMTP account; once sent, the notification is cached in memory (same in-memory cache pattern used for the catalog cache) and surfaced as `recentShipmentNotifications` on the dashboard endpoint.
* If the notification queue/credentials are not configured in this environment, the status transition still succeeds; only the notification is skipped (logged as a warning).

### ENDPOINT RESTRICTIONS

* Only the Operator role (OPPRU) can call this endpoint.
* Status transitions are strictly sequential; it is not possible to skip a step or move an invoice backwards from this endpoint.
* A failed/delayed email delivery never rolls back the status change — notifications are best effort and asynchronous via SQS.
* Messages that fail to send are retried by SQS up to `SQS_MAX_RECEIVE_COUNT` times (default 5) before SQS redrives them automatically to the dead-letter queue (DLQ) configured on the main queue.

## ENDPOINT TO CREATE A PRE ORDER (SHOPPING CART)

### ENDPOINT INFO

* path: /api/client/pre-order
* method: POST
* request json

```json
{
  "idShippmentMethod": "number",
  "addressLine1": "string",
  "addressLine2": "string | null",
  "items": [
    { "idProductVariant": "number", "quantity": "number" }
  ]
}
```

* response data: `{ "idInvoice": "number", "invoiceNumber": "string" }`, message "Pre orden creada correctamente"

### ENDPOINT BEHAVIOR

* Creates a new `Invoice` in status `En pre orden` for the authenticated client (`IDUser` from JWT), together with its `InvoiceItem` rows (one per cart line, `PriceShiped` snapshotted from the variant's current price).
* Reserves inventory immediately: each requested quantity is subtracted from `ProductVariant.Quantity` inside the same transaction that creates the invoice, so a second client cannot buy the same units while this cart is pending. Each reservation is also recorded in `InventoryMove` (`moveType = RESERVA`).
* The whole operation is all-or-nothing: if any line does not have enough stock, nothing is created and nothing is reserved (CLI0002).
* `InvoiceNumber` and `DocumentNumber` are generated right after the invoice is created (`INV-yyyyMMdd-000001` / `DOC-000001`).
* `LastItemAddedAt` is set to the creation time; this is the timestamp the expiration worker (see below) uses to compute how long the cart has been idle.
* `IDCuponApplied` is left empty here on purpose — a coupon is only validated and attached when the client confirms the shipment (see "ENDPOINT TO CONFIRM SHIPMENT"), since that is the point where "one coupon per shipment" actually matters.

### ENDPOINT RESTRICTIONS

* Only the Client role (RCPU) can call this endpoint.
* `items` must contain at least one line, each with `quantity > 0`.
* `idShippmentMethod` must exist (CLI0009); every `idProductVariant` must exist and be active (CLI0001).

## ENDPOINT TO ADD AN ITEM TO AN EXISTING PRE ORDER

### ENDPOINT INFO

* path: /api/client/pre-order/:idInvoice/item
* method: POST
* request json

```json
{
  "idProductVariant": "number",
  "quantity": "number"
}
```

* response message with data: null is "Producto agregado a la pre orden correctamente"

### ENDPOINT BEHAVIOR

* Lets a client keep adding products to a cart that is still open, instead of forcing the whole cart to be sent in one single request.
* Reserves the requested quantity the same way the creation endpoint does (temporary stock decrement + `InventoryMove` RESERVA row).
* Updates `Invoice.LastItemAddedAt = now` on every call, which is exactly the "last item added time" the expiration worker checks.

### ENDPOINT RESTRICTIONS

* Only the Client role (RCPU) can call this endpoint.
* The invoice must exist, belong to the authenticated client and still be in status `En pre orden`, otherwise CLI0003 (not found/not owned) or CLI0004 (no longer modifiable, e.g. already expired or already confirmed).
* Same stock/variant validations as the creation endpoint (CLI0001 / CLI0002).

## ENDPOINT TO CONFIRM SHIPMENT

### ENDPOINT INFO

* path: /api/client/shippment/:idInvoice
* method: PATCH
* request json

```json
{
  "cuponCode": "string | null"
}
```

* response data: `{ "idInvoice", "invoiceNumber", "subtotal", "shippingPrice", "taxAmount", "discountAmount", "total" }`, message "Envio confirmado correctamente"

### ENDPOINT BEHAVIOR

* This is the "checkout" step: it turns a pre orden cart into an actual shipment, moving `Invoice.IDShipmentStatus` from `En pre orden` to `A la espera de guia`.
* If `cuponCode` is provided, the coupon is validated here (not at cart creation): must exist and be active (CLI0005), not be expired (CLI0006), and not have reached `limitUseTotal` / `limitUsePerClient` (CLI0007). Usage is counted by querying how many non "No transicionada" invoices already have that `IDCuponApplied` — exactly the same "temporary substraction, like product variants" behaviour requested: once an invoice expires and is marked `No transicionada` it stops counting against the coupon's limit, the same way its reserved inventory is released.
* Totals are computed (never persisted as a column) as:
  * `subtotal` = sum of `PriceShiped * Quantity` over the invoice's active items.
  * `shippingPrice` = the selected `CatShippmentMethod.ShipmentPrice`.
  * `taxAmount` = `subtotal * TAX_IVA_PERCENTAGE` (env configurable, default 12%).
  * `discountAmount`: if the coupon is `isPerCategory`, the discount base is only the subtotal of items whose product belongs to one of `CuponPerCategory`'s categories; otherwise the base is the full subtotal. `Monto fijo` coupons subtract `min(CuponValue, base)`; percentual coupons subtract `base * CuponValue%`.
  * `total` = `subtotal + shippingPrice + taxAmount - discountAmount` (floored at 0).
* This same calculation (in `ClientHelper`) is reused by the invoice list/detail endpoints below, so what the client sees there always matches what was confirmed here.

### ENDPOINT RESTRICTIONS

* Only the Client role (RCPU), and only for the authenticated client's own invoice (CLI0003/CLI0008).
* The invoice must still be in `En pre orden` (CLI0004) and must have at least one item (CLI0010).
* A shipment can only ever have one coupon; it is set exactly once, at this step.

## ENDPOINT TO LIST OWN INVOICES

### ENDPOINT INFO

* path: /api/client/invoice
* method: GET
* request query params: `pageNumber` (default 1), `pageSize` (default 20), `idShipmentStatus` (optional), `from` / `to` (optional, filters by InvoiceDate)

### ENDPOINT BEHAVIOR

* Returns, paginated, every invoice that belongs to the authenticated client (any status, including expired/pre orden ones, for full purchase history transparency), each one with its computed `subtotal`, `shippingPrice`, `taxAmount`, `discountAmount` and `total` (same formula as the confirm-shipment endpoint) plus the applied coupon code if any.

### ENDPOINT RESTRICTIONS

* Only the Client role (RCPU); always scoped to `IDUser` from the JWT, a client can never see another client's invoices through this endpoint.

## ENDPOINT TO GET INVOICE DETAIL

### ENDPOINT INFO

* path: /api/client/invoice/:idInvoice
* method: GET

### ENDPOINT BEHAVIOR

* Returns the full invoice: address, shipment method, shipment status/guide, coupon info, computed totals, and the line items (variant, SKU, product name, quantity, unit price, line total, whether it was reversed).

### ENDPOINT RESTRICTIONS

* Only the Client role (RCPU). If the invoice does not exist or does not belong to the authenticated client, CLI0008 is thrown (same error either way, to avoid leaking whether an invoice id exists).

## ENDPOINT TO LIST SHIPMENTS (OPERATOR)

### ENDPOINT INFO

* path: /api/operator/shippment
* method: GET
* request query params: `pageNumber` (default 1), `pageSize` (default 20), `from` / `to` (filters by InvoiceDate), `idShipmentStatus` (optional), `idShippmentMethod` (optional)

### ENDPOINT BEHAVIOR

* Lists, paginated, every invoice whose status is **not** `En pre orden` and **not** `No transicionada` — i.e. only confirmed shipments, exactly as requested ("get all shippments in status where is not no transicionada, or pre order, only confirmed shippments status").
* `idShipmentStatus`/`idShippmentMethod`/date range are optional filters on top of that base rule.

### ENDPOINT RESTRICTIONS

* Only the Operator role (OPPRU).
* Requesting `idShipmentStatus` = pre orden or no transicionada simply returns an empty page, it does not bypass the base exclusion.

## ENDPOINT TO GET THE DASHBOARD (ADMIN + OPERATOR)

### ENDPOINT INFO

* path: /api/common/dashboard
* method: GET

### ENDPOINT BEHAVIOR

* Returns, computed live from the DB:
  * `mostShippedVariants`: top 5 product variants by total quantity shipped (invoices that reached `Entregado a servicio delivery` or `Entregado al cliente final`, non reversed items).
  * `leastShippedVariants`: bottom 5 (includes variants with zero units shipped).
  * `topCategories`: top 5 product types by total units sold under the same "shipped" definition.
  * `recentShipmentNotifications`: the last shipment-status email notifications actually sent, taken from the in-memory cache described in the "move shipment status" endpoint above.

### ENDPOINT RESTRICTIONS

* Accessible to both Admin (ADPRU) and Operator (OPPRU) roles, as it lives under the shared `api/common` controller.
* Read-only, no filters for now (not requested beyond these metrics).

## PRE ORDER EXPIRATION WORKER

* This is not an HTTP endpoint; it is an in-process worker started from `index.ts` (`Application/Workers/ShipmentWorker.ts`) right after the DB pool and catalog cache are ready.
* Every `PREORDER_WORKER_INTERVAL_MS` (env configurable, default **1000 ms**, i.e. "every second" as requested) it calls `SP_Client_LiberarPreOrdenesExpiradas`, which finds every invoice still `En pre orden` whose `LastItemAddedAt` is older than `PREORDER_EXPIRATION_MINUTES` (env configurable, default **15 minutes**) and, in one transaction:
  * restores each reserved quantity back onto `ProductVariant.Quantity`,
  * records the restoration in `InventoryMove` (`moveType = LIBERACION`),
  * sets `rowStatus = 0` on the invoice and its items,
  * moves the invoice to status `No transicionada`.
* The same worker also owns the SQS side of shipment notifications: it long-polls the `SQS_QUEUE_NAME` queue, and for every message it renders the HTML email (`Core/Templates/EmailTemplates.ts`) and sends it through the Gmail SMTP account resolved from Secrets Manager (`SECRET_SMTP_CREDENTIALS_NAME`); only after a successful send is the message deleted from the queue and the notification cached for the dashboard. A message that keeps failing is redelivered by SQS until `SQS_MAX_RECEIVE_COUNT` is reached, at which point SQS itself moves it to the `SQS_DLQ_NAME` dead-letter queue (both queues, and the DLQ wiring via `RedrivePolicy`, are created on startup if they don't exist yet in floci).
* AWS credentials for SQS are resolved the same way as S3's: the queue **names** are plain `.env` configuration, but the IAM credentials used to talk to SQS live in Secrets Manager (`SECRET_SQS_CREDENTIALS_NAME` -> JSON `{accessKeyId, secretAccessKey, region}`), scoped only to these two queues.
* If the DB pool, SMTP credentials or SQS credentials are not available in a given environment, the worker degrades gracefully: the pre order release loop always runs (it only needs the DB), while the notification side is simply skipped with a warning log.

### MESSAGE ERROR AND SUCCESS BY CODE

* OK0011: Se agrego correctamente a inventario
* OK0012: Estado de envio actualizado correctamente
* OK0013: Pre orden creada correctamente
* OK0014: Producto agregado a la pre orden correctamente
* OK0015: Envio confirmado correctamente
* OP0001: No se puede quitar la cantidad indicada del producto por que no se pueden quedar con inventario negativo
* OP0002: La factura indicada no existe
* OP0003: La factura no se encuentra en un estado valido para transicionar su envio
* OP0004: La variante de producto indicada no existe o se encuentra inactiva
* OP0005: Debe indicar la guia de envio para poder transicionar a entregado al servicio de delivery
* CLI0001: La variante de producto indicada no existe o se encuentra inactiva
* CLI0002: No hay suficiente inventario disponible para completar la solicitud
* CLI0003: La pre orden indicada no existe
* CLI0004: La pre orden no se encuentra en un estado que permita esta operacion
* CLI0005: El codigo de cupon indicado no existe
* CLI0006: El cupon indicado se encuentra expirado
* CLI0007: El cupon indicado alcanzo su limite de usos
* CLI0008: La factura indicada no existe
* CLI0009: El metodo de envio indicado no existe
* CLI0010: La pre orden debe contar con al menos un producto para confirmar el envio

