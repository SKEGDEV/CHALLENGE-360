USE master;
GO

IF DB_ID('shopCart') IS NOT NULL
BEGIN
    ALTER DATABASE shopCart SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE shopCart;
END
GO

CREATE DATABASE shopCart;
GO

USE shopCart;
GO

-- ==========================================
-- 1. CREACIÓN DE TABLAS
-- ==========================================

CREATE TABLE userSystem(
  IDUser int primary key identity(1,1) not null,
  UserFirstName varchar(200) not null,
  UserLastName varchar(200) not null,
  UserPassword varchar(300) not null,
  UserEmail varchar(150) not null,
  UserBirthday Datetime not null,
  isUserActive bit not null default 1
);

CREATE TABLE SystemEntity(
  IDSystem int primary key identity(1,1) not null,
  SystemName varchar(100) not null,
  SystemDescription varchar(400) not null,
  SystemPublicCode varchar(50) not null
);

CREATE TABLE Session(
  IDSession int primary key identity(1,1) not null,
  IDUser int not null,
  SessionRefreshToken varchar(150),
  SessionRefreshTokenExpire Datetime,
  SessionIsActive bit not null
);

CREATE TABLE Role(
  IDRole int primary key identity(1,1) not null,
  IDSystem int not null,
  RoleName varchar(100) not null,
  RoleDescription varchar(400) not null,
  RolePublicCode varchar(50) not null
);

CREATE TABLE CatResourceType(
  IDResourceType int primary key identity(1,1) not null,
  ResourceTypeName varchar(100) not null,
  ResourceTypeDescription varchar(400) not null
);

CREATE TABLE Resource(
  IDResource int primary key identity(1,1) not null,
  ResourceName varchar(100) not null,
  ResourceDescription varchar(400) not null,
  IDResourceType int not null,
  ResourcePath varchar(200) not null,
  ResourceIcon varchar(100),
  ResourceComponent varchar(150),
  IDResourceParent int NULL
);

-- Tabla de normalización (Muchos a Muchos)
CREATE TABLE RoleResource(
  IDRole int not null,
  IDResource int not null,
  PRIMARY KEY (IDRole, IDResource)
);

CREATE TABLE CatProductType(
  IDProductType int primary key identity(1,1) not null,
  ProductTypeName varchar(100) not null,
  ProductTypeDescription varchar(400) not null
);

CREATE TABLE Product(
  IDProduct int primary key identity(1,1) not null,
  IDProductType int not null,
  ProductName varchar(100) not null,
  ProductDescription varchar(600) not null,
  ProductUserCreatedBy int not null,
  ProductUserCreatedAt Datetime not null,
  ProductUserUpdatedBy int NULL,
  ProductUserUpdatedAt Datetime NULL,
  ProductPublicCode varchar(50) not null,
  rowStatus bit not null
);

CREATE TABLE ProductVariant(
  IDVariant int primary key identity(1,1) not null,
  IDProduct int not null,
  SKU varchar(100) not null,
  Size varchar(50),
  Color varchar(100),
  Features varchar(400),
  Price decimal(18,2) not null,
  Quantity int not null,
  isDefault bit not null,
  rowStatus bit not null,
  VariantUserCreatedBy int not null,
  VariantUserCreatedAt Datetime not null,
  VariantUserUpdatedBy int NULL,
  VariantUserUpdatedAt Datetime NULL
);

CREATE TABLE StoredFile(
  IDFile int primary key identity(1,1) not null,
  IDProductVariant int not null,
  FileName varchar(50) not null,
  FileBucketKey varchar(200) not null,
  FileContentType varchar(100) not null,
  FileUserCreatedBy int not null,
  FileUserCreatedAt Datetime not null,
  FileUserUpdatedBy int NULL,
  FileUserUpdatedAt Datetime NULL
);

CREATE TABLE CatShippmentStatus(
  IDShippmentStatus int primary key identity(1,1) not null,
  ShippmentStatusName varchar(100) not null,
  ShipmentStatusDescription varchar(400) not null
);

CREATE TABLE CatShippmentMethod(
  IDShipmmentMethod int primary key identity(1,1) not null,
  ShippmentMethodCompanyName varchar(100) not null,
  ShippmentMethodDescription varchar(400) not null,
  ShipmentPrice decimal(18,2) not null,
  ShipmentLogoCompanyBucketKey varchar(200) not null
);

CREATE TABLE CatCuponType(
  IDCuponType int primary key identity(1,1) not null,
  CuponTypeName varchar(100) not null,
  CuponTypeDescription varchar(400) not null
);

CREATE TABLE Cupon(
  IDCupon int primary key identity(1,1) not null,
  IDCuponType int not null,
  CuponCode varchar(100) not null,
  limitUseTotal int not null,
  limitUsePerClient int not null,
  CuponValue decimal(18,2) not null,
  CuponExpiration Datetime not null,
  isPerCategory bit not null,
  CuponUserCreatedBy int not null,
  CuponUserCreatedAt Datetime not null,
  CuponUserUpdatedBy int NULL,
  CuponUserUpdatedAt Datetime NULL
);

-- Tabla de normalización (Muchos a Muchos)
CREATE TABLE CuponPerCategory(
  IDCupon int not null,
  IDProductType int not null,
  PRIMARY KEY (IDCupon, IDProductType)
);

CREATE TABLE CatReverseReason(
  IDReverseReason int primary key identity(1,1) not null,
  ReverseReasonName varchar(100) not null,
  ReverseReasonDescription varchar(400) not null
);

CREATE TABLE Invoice(
  IDInvoice int primary key identity(1,1) not null,
  IDUser int not null,
  AddressLine1 varchar(300) not null,
  AddressLine2 varchar(300),
  InvoiceDate Datetime not null,
  DocumentNumber varchar(50) not null,
  ShippmentGuide varchar(70),
  IDShipmentStatus int not null,
  IDShippmmentMethod int not null,
  IDCuponApplied int NULL,
  isPayVDelivered bit not null,
  isReversed bit not null,
  ReversedNotes varchar(200),
  InvoiceUserUpdatedBy int NULL,
  InvoiceUserUpdatedAt Datetime NULL
);

CREATE TABLE InvoiceItem(
  IDInvoiceItem int primary key identity(1,1),
  IDInvoice int not null,
  IDProductVariant int not null,
  Quantity int not null,
  PriceShiped decimal(18,2) not null,
  isReversed bit not null,
  IDReverseReason int NULL
);
GO

-- ==========================================
-- 2. INTEGRIDAD REFERENCIAL (FOREIGN KEYS)
-- ==========================================

ALTER TABLE Session ADD CONSTRAINT FK_Session_User FOREIGN KEY (IDUser) REFERENCES userSystem(IDUser);

ALTER TABLE Role ADD CONSTRAINT FK_Role_System FOREIGN KEY (IDSystem) REFERENCES SystemEntity(IDSystem);

ALTER TABLE Resource ADD CONSTRAINT FK_Resource_Type FOREIGN KEY (IDResourceType) REFERENCES CatResourceType(IDResourceType);
ALTER TABLE Resource ADD CONSTRAINT FK_Resource_Parent FOREIGN KEY (IDResourceParent) REFERENCES Resource(IDResource);

ALTER TABLE RoleResource ADD CONSTRAINT FK_RoleResource_Role FOREIGN KEY (IDRole) REFERENCES Role(IDRole);
ALTER TABLE RoleResource ADD CONSTRAINT FK_RoleResource_Resource FOREIGN KEY (IDResource) REFERENCES Resource(IDResource);

ALTER TABLE Product ADD CONSTRAINT FK_Product_Type FOREIGN KEY (IDProductType) REFERENCES CatProductType(IDProductType);
ALTER TABLE Product ADD CONSTRAINT FK_Product_UserCreated FOREIGN KEY (ProductUserCreatedBy) REFERENCES userSystem(IDUser);
ALTER TABLE Product ADD CONSTRAINT FK_Product_UserUpdated FOREIGN KEY (ProductUserUpdatedBy) REFERENCES userSystem(IDUser);

ALTER TABLE ProductVariant ADD CONSTRAINT FK_Variant_Product FOREIGN KEY (IDProduct) REFERENCES Product(IDProduct);
ALTER TABLE ProductVariant ADD CONSTRAINT FK_Variant_UserCreated FOREIGN KEY (VariantUserCreatedBy) REFERENCES userSystem(IDUser);
ALTER TABLE ProductVariant ADD CONSTRAINT FK_Variant_UserUpdated FOREIGN KEY (VariantUserUpdatedBy) REFERENCES userSystem(IDUser);

ALTER TABLE StoredFile ADD CONSTRAINT FK_StoredFile_Variant FOREIGN KEY (IDProductVariant) REFERENCES ProductVariant(IDVariant);
ALTER TABLE StoredFile ADD CONSTRAINT FK_StoredFile_UserCreated FOREIGN KEY (FileUserCreatedBy) REFERENCES userSystem(IDUser);
ALTER TABLE StoredFile ADD CONSTRAINT FK_StoredFile_UserUpdated FOREIGN KEY (FileUserUpdatedBy) REFERENCES userSystem(IDUser);

ALTER TABLE Cupon ADD CONSTRAINT FK_Cupon_Type FOREIGN KEY (IDCuponType) REFERENCES CatCuponType(IDCuponType);
ALTER TABLE Cupon ADD CONSTRAINT FK_Cupon_UserCreated FOREIGN KEY (CuponUserCreatedBy) REFERENCES userSystem(IDUser);
ALTER TABLE Cupon ADD CONSTRAINT FK_Cupon_UserUpdated FOREIGN KEY (CuponUserUpdatedBy) REFERENCES userSystem(IDUser);

ALTER TABLE CuponPerCategory ADD CONSTRAINT FK_CuponCategory_Cupon FOREIGN KEY (IDCupon) REFERENCES Cupon(IDCupon);
ALTER TABLE CuponPerCategory ADD CONSTRAINT FK_CuponCategory_ProductType FOREIGN KEY (IDProductType) REFERENCES CatProductType(IDProductType);

ALTER TABLE Invoice ADD CONSTRAINT FK_Invoice_User FOREIGN KEY (IDUser) REFERENCES userSystem(IDUser);
ALTER TABLE Invoice ADD CONSTRAINT FK_Invoice_ShipStatus FOREIGN KEY (IDShipmentStatus) REFERENCES CatShippmentStatus(IDShippmentStatus);
ALTER TABLE Invoice ADD CONSTRAINT FK_Invoice_ShipMethod FOREIGN KEY (IDShippmmentMethod) REFERENCES CatShippmentMethod(IDShipmmentMethod);
ALTER TABLE Invoice ADD CONSTRAINT FK_Invoice_Cupon FOREIGN KEY (IDCuponApplied) REFERENCES Cupon(IDCupon);
ALTER TABLE Invoice ADD CONSTRAINT FK_Invoice_UserUpdated FOREIGN KEY (InvoiceUserUpdatedBy) REFERENCES userSystem(IDUser);

ALTER TABLE InvoiceItem ADD CONSTRAINT FK_InvoiceItem_Invoice FOREIGN KEY (IDInvoice) REFERENCES Invoice(IDInvoice);
ALTER TABLE InvoiceItem ADD CONSTRAINT FK_InvoiceItem_Variant FOREIGN KEY (IDProductVariant) REFERENCES ProductVariant(IDVariant);
ALTER TABLE InvoiceItem ADD CONSTRAINT FK_InvoiceItem_ReverseReason FOREIGN KEY (IDReverseReason) REFERENCES CatReverseReason(IDReverseReason);
GO

-- ==========================================
-- 3. ÍNDICES DE RENDIMIENTO Y UNICIDAD
-- ==========================================

-- Índices Únicos (Restricciones de negocio)
CREATE UNIQUE NONCLUSTERED INDEX UQ_UserEmail ON userSystem(UserEmail);
CREATE UNIQUE NONCLUSTERED INDEX UQ_SystemPublicCode ON SystemEntity(SystemPublicCode);
CREATE UNIQUE NONCLUSTERED INDEX UQ_RolePublicCode ON Role(RolePublicCode);
CREATE UNIQUE NONCLUSTERED INDEX UQ_ProductPublicCode ON Product(ProductPublicCode);
CREATE UNIQUE NONCLUSTERED INDEX UQ_SKU ON ProductVariant(SKU);
CREATE UNIQUE NONCLUSTERED INDEX UQ_CuponCode ON Cupon(CuponCode);

-- Índices en Llaves Foráneas (Optimización de JOINs)
CREATE NONCLUSTERED INDEX IX_Session_IDUser ON Session(IDUser);
CREATE NONCLUSTERED INDEX IX_Role_IDSystem ON Role(IDSystem);
CREATE NONCLUSTERED INDEX IX_Resource_IDResourceType ON Resource(IDResourceType);
CREATE NONCLUSTERED INDEX IX_Product_IDProductType ON Product(IDProductType);
CREATE NONCLUSTERED INDEX IX_ProductVariant_IDProduct ON ProductVariant(IDProduct);
CREATE NONCLUSTERED INDEX IX_StoredFile_IDProductVariant ON StoredFile(IDProductVariant);
CREATE NONCLUSTERED INDEX IX_Cupon_IDCuponType ON Cupon(IDCuponType);
CREATE NONCLUSTERED INDEX IX_Invoice_IDUser ON Invoice(IDUser);
CREATE NONCLUSTERED INDEX IX_InvoiceItem_IDInvoice ON InvoiceItem(IDInvoice);
CREATE NONCLUSTERED INDEX IX_InvoiceItem_IDProductVariant ON InvoiceItem(IDProductVariant);
GO

-- ==========================================
-- 4. INSERCIÓN DE DATOS (SEED DATA)
-- ==========================================

INSERT INTO SystemEntity (SystemName, SystemDescription, SystemPublicCode)
VALUES ('shopCartChallenge', 'Sistema encargado de la shopCart challenge cumpliendo los criterios solicitados', 'SHCAPP');

-- Obtener el ID dinámico generado para SystemEntity e insertar Roles
DECLARE @CurrentSystemID int = SCOPE_IDENTITY();

INSERT INTO Role (IDSystem, RoleName, RoleDescription, RolePublicCode) 
VALUES 
    (@CurrentSystemID, 'Client', 'Usuario cliente puede realizar compras', 'RCPU'),
    (@CurrentSystemID, 'Operator', 'Usuario operador encargado de gestionar pedidos e inventario', 'OPPRU'),
    (@CurrentSystemID, 'Admin', 'Usuario encargado de gestionar catalogo, precios, cupones, usuarios y reportes', 'ADPRU');

INSERT INTO CatResourceType (ResourceTypeName, ResourceTypeDescription) 
VALUES
    ('MENUPARENT', 'Padre del arbol de vistas'),
    ('VIEW', 'Vista a secas'),
    ('COMPONENT', 'Componente en especifico de una misma vista pero distionto role'),
    ('ENDPOINT', 'Endpoint al cual un usuario tiene acceso');

INSERT INTO CatProductType (ProductTypeName, ProductTypeDescription) 
VALUES 
    ('Ropa adultos', 'Ropa especial para adultos segun moda actual'),
    ('Ropa niños', 'Ropa especial para niños segun moda actual'),
    ('Zapatos', 'Variedad de zapatos pueden ser deportivos, casuales, etc'),
    ('Accesorios', 'Variedad de accesorios de moda'); 

INSERT INTO CatShippmentStatus (ShippmentStatusName, ShipmentStatusDescription) 
VALUES 
    ('A la espera de guia', 'Se esta a la espera que un operador genere la guia para ser enviado'),
    ('Entregado a servicio delivery', 'Se entrego el envio al servicio de delivery seleccionado'),
    ('Entregado al cliente final', 'El paquete cumplio su ciclo logistico y se encuentra entregado al cliente final'),
    ('Devolucion', 'El paquete fue reversado por razones internas con el cliente se debera hacer una nueva factura manual para solucionar la reversa');

INSERT INTO CatShippmentMethod (ShippmentMethodCompanyName, ShippmentMethodDescription, ShipmentPrice, ShipmentLogoCompanyBucketKey) 
VALUES 
    ('Forza', 'Forza delivery express normalmente tardan 24 hrs para entregar un pedido', 35.0, 'shipmentMethod/Forza.png'),
    ('Guatex', 'Guatex normalmente tardan 24 hrs para entregar un pedido', 30.0, 'shipmentMethod/Guatex.png'),
    ('CargoExpress', 'CargoExpress normalmente tardan 24 hrs para entregar un pedido', 32.5, 'shipmentMethod/CargoExpress.png');

INSERT INTO CatCuponType (CuponTypeName, CuponTypeDescription) 
VALUES 
    ('Porcentual', 'El porcentaje se aplica a toda la factura bien sea a las categorias asignadas o al total de la factura'),
    ('Monto fijo', 'El monto fijo se aplica sobre el precio total de la factura o el precio sobre las categorias asignadas');

INSERT INTO CatReverseReason (ReverseReasonName, ReverseReasonDescription) 
VALUES 
    ('Talla incorrecta', 'La talla no es la esperada'),
    ('Color incorrecto', 'El color no es el esperado'),
    ('Articulo incorrecto', 'El articulo no cumple con lo mostrado en el catalogo'),
    ('Otro', 'Explicado en las notas de devolucion');
GO
