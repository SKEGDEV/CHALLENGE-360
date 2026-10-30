USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Auth_ObtenerUsuarioPorEmail
  @UserEmail varchar(150)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT IDUser, UserFirstName, UserLastName, UserPassword, UserEmail
  FROM userSystem
  WHERE UserEmail = @UserEmail
    AND isUserActive = 1;
END
GO
