USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_CrearCupon
  @IDCuponType int,
  @CuponCode varchar(100),
  @LimitUseTotal int,
  @LimitUsePerClient int,
  @CuponValue decimal(18,2),
  @CuponExpiration datetime,
  @IsPerCategory bit,
  @CreatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM Cupon WHERE CuponCode = @CuponCode)
  BEGIN
    ;THROW 51020, 'CUPON_CODE_EXISTS', 1;
  END

  INSERT INTO Cupon (IDCuponType, CuponCode, limitUseTotal, limitUsePerClient, CuponValue, CuponExpiration, isPerCategory, rowStatus, CuponUserCreatedBy, CuponUserCreatedAt)
  VALUES (@IDCuponType, @CuponCode, @LimitUseTotal, @LimitUsePerClient, @CuponValue, @CuponExpiration, @IsPerCategory, 1, @CreatedBy, GETDATE());

  SELECT SCOPE_IDENTITY() AS IDCupon;
END
GO
