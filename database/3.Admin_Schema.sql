USE shopCart;
GO

-- ==========================================
-- CORRECCION DE DRIFT: columnas rowStatus
-- agregadas a 1.Schema.sql despues de que
-- algunos entornos ya tenian la base creada.
-- ==========================================

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CatProductType') AND name = 'rowStatus')
BEGIN
  ALTER TABLE CatProductType ADD rowStatus bit NOT NULL CONSTRAINT DF_CatProductType_rowStatus DEFAULT 1;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Cupon') AND name = 'rowStatus')
BEGIN
  ALTER TABLE Cupon ADD rowStatus bit NOT NULL CONSTRAINT DF_Cupon_rowStatus DEFAULT 1;
END
GO

-- ==========================================
-- RECURSOS Y PERMISOS PARA LOS ENDPOINTS DE
-- ADMINISTRACION (spect_00002_Admin_flows.md)
--
-- Cada endpoint admin queda protegido por
-- buildValidateRoleMiddleware, que valida el
-- ResourcePath contra Resource/RoleResource
-- para el rol del usuario autenticado.
-- ==========================================

DECLARE @AdminResources TABLE (
  ResourceName varchar(100),
  ResourceDescription varchar(400),
  ResourcePath varchar(200)
);

INSERT INTO @AdminResources (ResourceName, ResourceDescription, ResourcePath)
VALUES
  ('Crear o actualizar producto', 'Permite crear y actualizar productos junto con sus variantes y fotografias', '/api/admin/product'),
  ('Generar URLs prefirmadas', 'Permite generar URLs prefirmadas de S3 para subir archivos', '/api/admin/stored-file'),
  ('Gestionar producto por id', 'Permite obtener el detalle y eliminar un producto especifico', '/api/admin/product/:idProduct'),
  ('Inactivar usuario', 'Permite inactivar la cuenta de un usuario', '/api/admin/user/:idUser/inactivate'),
  ('Gestionar cupones', 'Permite crear y listar cupones', '/api/admin/cupon'),
  ('Gestionar cupon por id', 'Permite obtener, actualizar y eliminar un cupon especifico', '/api/admin/cupon/:idCupon'),
  ('Gestionar tipos de producto', 'Permite crear y listar tipos de producto', '/api/admin/product-type'),
  ('Gestionar tipo de producto por id', 'Permite obtener, actualizar y eliminar un tipo de producto especifico', '/api/admin/product-type/:idProductType');

INSERT INTO Resource (ResourceName, ResourceDescription, IDResourceType, ResourcePath, ResourceIcon, ResourceComponent, IDResourceParent)
SELECT ar.ResourceName, ar.ResourceDescription, rt.IDResourceType, ar.ResourcePath, NULL, NULL, NULL
FROM @AdminResources ar
CROSS JOIN (SELECT IDResourceType FROM CatResourceType WHERE ResourceTypeName = 'ENDPOINT') rt
WHERE NOT EXISTS (SELECT 1 FROM Resource r WHERE r.ResourcePath = ar.ResourcePath);
GO

INSERT INTO RoleResource (IDRole, IDResource)
SELECT r.IDRole, res.IDResource
FROM Role r
INNER JOIN Resource res ON res.ResourcePath IN (
  '/api/admin/product',
  '/api/admin/stored-file',
  '/api/admin/product/:idProduct',
  '/api/admin/user/:idUser/inactivate',
  '/api/admin/cupon',
  '/api/admin/cupon/:idCupon',
  '/api/admin/product-type',
  '/api/admin/product-type/:idProductType'
)
WHERE r.RolePublicCode = 'ADPRU'
  AND NOT EXISTS (
    SELECT 1 FROM RoleResource rr WHERE rr.IDRole = r.IDRole AND rr.IDResource = res.IDResource
  );
GO
