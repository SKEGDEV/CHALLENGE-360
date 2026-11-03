USE shopCart;
GO

-- ==========================================
-- CORRECCION DE DRIFT Y NUEVAS COLUMNAS
-- requeridas por spect_00003_operator_client_flows.md
-- ==========================================

-- InvoiceItem no contaba con rowStatus; se necesita para poder
-- "eliminar" (desactivar) los items cuando una pre orden expira.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('InvoiceItem') AND name = 'rowStatus')
BEGIN
  ALTER TABLE InvoiceItem ADD rowStatus bit NOT NULL CONSTRAINT DF_InvoiceItem_rowStatus DEFAULT 1;
END
GO

-- Invoice tampoco contaba con rowStatus en algunos entornos (drift previo
-- a este spec); se necesita para poder desactivar la factura cuando una
-- pre orden expira.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Invoice') AND name = 'rowStatus')
BEGIN
  ALTER TABLE Invoice ADD rowStatus bit NOT NULL CONSTRAINT DF_Invoice_rowStatus DEFAULT 1;
END
GO

-- Invoice necesita saber cuando fue agregado el ultimo item para que el
-- worker de expiracion de pre ordenes pueda calcular el tiempo de limbo.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Invoice') AND name = 'LastItemAddedAt')
BEGIN
  ALTER TABLE Invoice ADD LastItemAddedAt Datetime NULL;
END
GO

-- ==========================================
-- InventoryMove: la tabla ya estaba en el ERD original (1.Schema.sql),
-- pero su definicion tenia un error de sintaxis (a IDProductVariant le
-- faltaba el tipo "int"), por lo que en entornos donde ya se habia corrido
-- 1.Schema.sql antes de corregirlo la tabla nunca llego a crearse. Se crea
-- aqui de forma idempotente para esos entornos; en los nuevos (DB recien
-- creada con el 1.Schema.sql ya corregido) este bloque no hace nada.
-- ==========================================

IF OBJECT_ID('dbo.InventoryMove', 'U') IS NULL
BEGIN
  CREATE TABLE InventoryMove(
    IDMove int primary key identity(1,1),
    IDUserMove int not null,
    IDProductVariant int not null,
    Quantity int not null,
    moveType varchar(20) not null,
    MoveCreatedAt Datetime not null default GETDATE()
  );
END
GO

-- ==========================================
-- INTEGRIDAD REFERENCIAL E INDICES FALTANTES
-- PARA InventoryMove
-- ==========================================

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_InventoryMove_User')
BEGIN
  ALTER TABLE InventoryMove ADD CONSTRAINT FK_InventoryMove_User FOREIGN KEY (IDUserMove) REFERENCES userSystem(IDUser);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_InventoryMove_Variant')
BEGIN
  ALTER TABLE InventoryMove ADD CONSTRAINT FK_InventoryMove_Variant FOREIGN KEY (IDProductVariant) REFERENCES ProductVariant(IDVariant);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_InventoryMove_Variant' AND object_id = OBJECT_ID('InventoryMove'))
BEGIN
  CREATE NONCLUSTERED INDEX IX_InventoryMove_Variant ON InventoryMove(IDProductVariant);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Invoice_InvoiceNumber' AND object_id = OBJECT_ID('Invoice'))
BEGIN
  CREATE UNIQUE NONCLUSTERED INDEX UQ_Invoice_InvoiceNumber ON Invoice(InvoiceNumber);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Invoice_Status' AND object_id = OBJECT_ID('Invoice'))
BEGIN
  CREATE NONCLUSTERED INDEX IX_Invoice_Status ON Invoice(IDShipmentStatus);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Invoice_InvoiceDate' AND object_id = OBJECT_ID('Invoice'))
BEGIN
  CREATE NONCLUSTERED INDEX IX_Invoice_InvoiceDate ON Invoice(InvoiceDate);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Invoice_LastItemAddedAt' AND object_id = OBJECT_ID('Invoice'))
BEGIN
  CREATE NONCLUSTERED INDEX IX_Invoice_LastItemAddedAt ON Invoice(LastItemAddedAt);
END
GO

-- ==========================================
-- RECURSOS Y PERMISOS PARA LOS ENDPOINTS DE
-- OPERADOR Y CLIENTE (spect_00003_operator_client_flows.md)
-- ==========================================

DECLARE @NewResources TABLE (
  ResourceName varchar(100),
  ResourceDescription varchar(400),
  ResourcePath varchar(200)
);

INSERT INTO @NewResources (ResourceName, ResourceDescription, ResourcePath)
VALUES
  ('Ajustar inventario', 'Permite sumar o restar cantidades de inventario por SKU', '/api/operator/inventory'),
  ('Actualizar estado de envio', 'Permite transicionar el estado de envio de una factura y asignar guia', '/api/operator/shippment-status'),
  ('Listar envios', 'Permite listar de forma paginada los envios confirmados (no pre orden ni no transicionados)', '/api/operator/shippment'),
  ('Crear pre orden', 'Permite a un cliente crear una pre orden (carrito) reservando inventario', '/api/client/pre-order'),
  ('Agregar item a pre orden', 'Permite agregar un producto a una pre orden existente', '/api/client/pre-order/:idInvoice/item'),
  ('Confirmar envio', 'Permite confirmar una pre orden como envio aplicando cupon si corresponde', '/api/client/shippment/:idInvoice'),
  ('Listar facturas propias', 'Permite al cliente listar sus propias facturas de forma paginada', '/api/client/invoice'),
  ('Obtener factura propia', 'Permite al cliente obtener el detalle de una factura propia', '/api/client/invoice/:idInvoice'),
  ('Dashboard de envios', 'Permite a administradores y operadores ver metricas de envios', '/api/common/dashboard');

INSERT INTO Resource (ResourceName, ResourceDescription, IDResourceType, ResourcePath, ResourceIcon, ResourceComponent, IDResourceParent)
SELECT nr.ResourceName, nr.ResourceDescription, rt.IDResourceType, nr.ResourcePath, NULL, NULL, NULL
FROM @NewResources nr
CROSS JOIN (SELECT IDResourceType FROM CatResourceType WHERE ResourceTypeName = 'ENDPOINT') rt
WHERE NOT EXISTS (SELECT 1 FROM Resource r WHERE r.ResourcePath = nr.ResourcePath);
GO

INSERT INTO RoleResource (IDRole, IDResource)
SELECT r.IDRole, res.IDResource
FROM Role r
INNER JOIN Resource res ON res.ResourcePath IN (
  '/api/operator/inventory',
  '/api/operator/shippment-status',
  '/api/operator/shippment'
)
WHERE r.RolePublicCode = 'OPPRU'
  AND NOT EXISTS (SELECT 1 FROM RoleResource rr WHERE rr.IDRole = r.IDRole AND rr.IDResource = res.IDResource);
GO

INSERT INTO RoleResource (IDRole, IDResource)
SELECT r.IDRole, res.IDResource
FROM Role r
INNER JOIN Resource res ON res.ResourcePath IN (
  '/api/client/pre-order',
  '/api/client/pre-order/:idInvoice/item',
  '/api/client/shippment/:idInvoice',
  '/api/client/invoice',
  '/api/client/invoice/:idInvoice'
)
WHERE r.RolePublicCode = 'RCPU'
  AND NOT EXISTS (SELECT 1 FROM RoleResource rr WHERE rr.IDRole = r.IDRole AND rr.IDResource = res.IDResource);
GO

-- Dashboard es compartido entre Admin y Operator
INSERT INTO RoleResource (IDRole, IDResource)
SELECT r.IDRole, res.IDResource
FROM Role r
INNER JOIN Resource res ON res.ResourcePath = '/api/common/dashboard'
WHERE r.RolePublicCode IN ('ADPRU', 'OPPRU')
  AND NOT EXISTS (SELECT 1 FROM RoleResource rr WHERE rr.IDRole = r.IDRole AND rr.IDResource = res.IDResource);
GO
