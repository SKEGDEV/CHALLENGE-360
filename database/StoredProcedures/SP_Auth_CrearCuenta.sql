USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Auth_CrearCuenta
  @UserFirstName varchar(200),
  @UserLastName varchar(200),
  @UserPasswordHash varchar(300),
  @UserEmail varchar(150),
  @UserBirthday datetime,
  @RolePublicCode varchar(50)
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM userSystem WHERE UserEmail = @UserEmail)
  BEGIN
    ;THROW 51000, 'EMAIL_ALREADY_EXISTS', 1;
  END

  DECLARE @IDRole int = (SELECT IDRole FROM Role WHERE RolePublicCode = @RolePublicCode);

  IF @IDRole IS NULL
  BEGIN
    ;THROW 51001, 'ROLE_NOT_FOUND', 1;
  END

  BEGIN TRANSACTION;

  INSERT INTO userSystem (UserFirstName, UserLastName, UserPassword, UserEmail, UserBirthday, isUserActive)
  VALUES (@UserFirstName, @UserLastName, @UserPasswordHash, @UserEmail, @UserBirthday, 1);

  DECLARE @NewIDUser int = SCOPE_IDENTITY();

  INSERT INTO UserRole (IDUser, IDRole) VALUES (@NewIDUser, @IDRole);

  COMMIT TRANSACTION;

  SELECT @NewIDUser AS IDUser, @RolePublicCode AS RolePublicCode;
END
GO
