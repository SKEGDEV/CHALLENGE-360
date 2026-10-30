USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Auth_ObtenerRolesPorUsuario
  @IDUser int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT r.RolePublicCode
  FROM UserRole ur
  INNER JOIN Role r ON r.IDRole = ur.IDRole
  WHERE ur.IDUser = @IDUser;
END
GO
