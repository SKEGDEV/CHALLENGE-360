USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Auth_ObtenerSesionPorToken
  @SessionRefreshToken varchar(150)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT IDSession, IDUser, SessionRefreshTokenExpire, SessionIsActive
  FROM Session
  WHERE SessionRefreshToken = @SessionRefreshToken;
END
GO
