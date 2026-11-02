USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_EliminarCupon
  @IDCupon int,
  @UpdatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE Cupon
  SET rowStatus = 0,
      CuponUserUpdatedBy = @UpdatedBy,
      CuponUserUpdatedAt = GETDATE()
  WHERE IDCupon = @IDCupon AND rowStatus = 1;

  IF @@ROWCOUNT = 0
  BEGIN
    ;THROW 51021, 'CUPON_NOT_FOUND', 1;
  END
END
GO
