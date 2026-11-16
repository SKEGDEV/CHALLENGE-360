USE shopCart;
GO

-- Lista usuarios paginados con su rol.
-- IDUserStatus (derivado de isUserActive): 1 = Activo, 2 = Inactivo, 3 = Bloqueado (sin uso actualmente).
CREATE OR ALTER PROCEDURE SP_Admin_ObtenerUsuarios
  @PageNumber int,
  @PageSize int,
  @Search varchar(200) = NULL,
  @IDUserStatus int = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    u.IDUser,
    u.UserFirstName,
    u.UserLastName,
    u.UserEmail,
    u.UserBirthday,
    CASE WHEN u.isUserActive = 1 THEN 1 ELSE 2 END AS IDUserStatus,
    ISNULL(r.RolePublicCode, '') AS RolePublicCode,
    COUNT(*) OVER() AS TotalCount
  FROM userSystem u
  OUTER APPLY (
    SELECT TOP 1 ro.RolePublicCode
    FROM UserRole ur
    INNER JOIN Role ro ON ro.IDRole = ur.IDRole
    WHERE ur.IDUser = u.IDUser
    ORDER BY ro.IDRole
  ) r
  WHERE (@IDUserStatus IS NULL OR (CASE WHEN u.isUserActive = 1 THEN 1 ELSE 2 END) = @IDUserStatus)
    AND (
      @Search IS NULL OR @Search = ''
      OR u.UserFirstName LIKE '%' + @Search + '%'
      OR u.UserLastName LIKE '%' + @Search + '%'
      OR u.UserEmail LIKE '%' + @Search + '%'
    )
  ORDER BY u.IDUser DESC
  OFFSET (@PageNumber - 1) * @PageSize ROWS
  FETCH NEXT @PageSize ROWS ONLY;
END
GO
