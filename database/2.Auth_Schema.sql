USE shopCart;
GO

-- ==========================================
-- 1. TABLA DE ASIGNACION DE ROLES A USUARIO
-- ==========================================
-- Requerida por los flujos de AUTH: el ERD original no tenia forma de
-- vincular un usuario con un rol, y tanto la creacion de cuenta con rol
-- como el decorador de validacion de rol dependen de esta relacion.

IF OBJECT_ID('dbo.UserRole', 'U') IS NULL
BEGIN
  CREATE TABLE UserRole(
    IDUser int not null,
    IDRole int not null,
    PRIMARY KEY (IDUser, IDRole)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_UserRole_User')
BEGIN
  ALTER TABLE UserRole ADD CONSTRAINT FK_UserRole_User FOREIGN KEY (IDUser) REFERENCES userSystem(IDUser);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_UserRole_Role')
BEGIN
  ALTER TABLE UserRole ADD CONSTRAINT FK_UserRole_Role FOREIGN KEY (IDRole) REFERENCES Role(IDRole);
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = 'IX_UserRole_IDRole' AND object_id = OBJECT_ID('dbo.UserRole')
)
BEGIN
  CREATE NONCLUSTERED INDEX IX_UserRole_IDRole ON UserRole(IDRole);
END
GO

-- ==========================================
-- 2. RECURSO Y PERMISO PARA EL ENDPOINT PRIVADO
--    DE CREACION DE CUENTA CON ROL
-- ==========================================

IF NOT EXISTS (SELECT 1 FROM Resource WHERE ResourcePath = '/api/auth/account/privado')
BEGIN
  INSERT INTO Resource (ResourceName, ResourceDescription, IDResourceType, ResourcePath, ResourceIcon, ResourceComponent, IDResourceParent)
  SELECT 'Crear usuario con rol', 'Permite crear un usuario asignando un rol especifico', IDResourceType, '/api/auth/account/privado', NULL, NULL, NULL
  FROM CatResourceType
  WHERE ResourceTypeName = 'ENDPOINT';
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM RoleResource rr
  INNER JOIN Role r ON r.IDRole = rr.IDRole
  INNER JOIN Resource res ON res.IDResource = rr.IDResource
  WHERE r.RolePublicCode = 'ADPRU'
    AND res.ResourcePath = '/api/auth/account/privado'
)
BEGIN
  INSERT INTO RoleResource (IDRole, IDResource)
  SELECT r.IDRole, res.IDResource
  FROM Role r
  CROSS JOIN Resource res
  WHERE r.RolePublicCode = 'ADPRU'
    AND res.ResourcePath = '/api/auth/account/privado';
END
GO
