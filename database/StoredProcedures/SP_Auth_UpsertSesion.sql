USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Auth_UpsertSesion
  @IDUser int,
  @SessionRefreshToken varchar(150),
  @SessionRefreshTokenExpire datetime
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM Session WHERE IDUser = @IDUser)
  BEGIN
    UPDATE Session
    SET SessionRefreshToken = @SessionRefreshToken,
        SessionRefreshTokenExpire = @SessionRefreshTokenExpire,
        SessionIsActive = 1
    WHERE IDUser = @IDUser;
  END
  ELSE
  BEGIN
    INSERT INTO Session (IDUser, SessionRefreshToken, SessionRefreshTokenExpire, SessionIsActive)
    VALUES (@IDUser, @SessionRefreshToken, @SessionRefreshTokenExpire, 1);
  END
END
GO
