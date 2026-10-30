USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Auth_RenovarToken
  @SessionRefreshTokenActual varchar(150),
  @SessionRefreshTokenNuevo varchar(150)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE Session
  SET SessionRefreshToken = @SessionRefreshTokenNuevo
  WHERE SessionRefreshToken = @SessionRefreshTokenActual
    AND SessionIsActive = 1;
END
GO
