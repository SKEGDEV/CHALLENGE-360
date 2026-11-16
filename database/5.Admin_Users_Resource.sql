USE shopCart;
GO

-- ==========================================
-- RECURSO Y PERMISO PARA GET /api/admin/user
-- (listado de usuarios). Faltaba en
-- 3.Admin_Schema.sql, por lo que el middleware
-- de roles rechazaba a ADPRU.
-- Idempotente: se puede ejecutar varias veces.
-- ==========================================

INSERT INTO Resource (ResourceName, ResourceDescription, IDResourceType, ResourcePath, ResourceIcon, ResourceComponent, IDResourceParent)
SELECT 'Listar usuarios', 'Permite listar los usuarios de forma paginada', rt.IDResourceType, '/api/admin/user', NULL, NULL, NULL
FROM CatResourceType rt
WHERE rt.ResourceTypeName = 'ENDPOINT'
  AND NOT EXISTS (SELECT 1 FROM Resource r WHERE r.ResourcePath = '/api/admin/user');
GO

INSERT INTO RoleResource (IDRole, IDResource)
SELECT r.IDRole, res.IDResource
FROM Role r
INNER JOIN Resource res ON res.ResourcePath = '/api/admin/user'
WHERE r.RolePublicCode = 'ADPRU'
  AND NOT EXISTS (
    SELECT 1 FROM RoleResource rr WHERE rr.IDRole = r.IDRole AND rr.IDResource = res.IDResource
  );
GO
