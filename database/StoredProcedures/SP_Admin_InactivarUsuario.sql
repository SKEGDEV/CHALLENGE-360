USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_InactivarUsuario
  @IDUser int
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE userSystem
  SET isUserActive = 0
  WHERE IDUser = @IDUser;

  IF @@ROWCOUNT = 0
  BEGIN
    ;THROW 51013, 'USER_NOT_FOUND', 1;
  END
END
GO
