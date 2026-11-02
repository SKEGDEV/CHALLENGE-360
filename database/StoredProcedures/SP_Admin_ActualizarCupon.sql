USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ActualizarCupon
  @IDCupon int,
  @IDCuponType int,
  @CuponCode varchar(100),
  @LimitUseTotal int,
  @LimitUsePerClient int,
  @CuponValue decimal(18,2),
  @CuponExpiration datetime,
  @IsPerCategory bit,
  @UpdatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM Cupon WHERE CuponCode = @CuponCode AND IDCupon <> @IDCupon)
  BEGIN
    ;THROW 51020, 'CUPON_CODE_EXISTS', 1;
  END

  UPDATE Cupon
  SET IDCuponType = @IDCuponType,
      CuponCode = @CuponCode,
      limitUseTotal = @LimitUseTotal,
      limitUsePerClient = @LimitUsePerClient,
      CuponValue = @CuponValue,
      CuponExpiration = @CuponExpiration,
      isPerCategory = @IsPerCategory,
      CuponUserUpdatedBy = @UpdatedBy,
      CuponUserUpdatedAt = GETDATE()
  WHERE IDCupon = @IDCupon AND rowStatus = 1;

  IF @@ROWCOUNT = 0
  BEGIN
    ;THROW 51021, 'CUPON_NOT_FOUND', 1;
  END
END
GO
