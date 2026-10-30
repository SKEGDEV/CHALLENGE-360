USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Auth_ValidarPermisoRol
  @RolePublicCode varchar(50),
  @ResourcePath varchar(200)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT COUNT(1) AS PermisoCount
  FROM RoleResource rr
  INNER JOIN Role r ON r.IDRole = rr.IDRole
  INNER JOIN Resource res ON res.IDResource = rr.IDResource
  WHERE r.RolePublicCode = @RolePublicCode
    AND res.ResourcePath = @ResourcePath;
END
GO
