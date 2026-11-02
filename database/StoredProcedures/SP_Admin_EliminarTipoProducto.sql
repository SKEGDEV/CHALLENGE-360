USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_EliminarTipoProducto
  @IDProductType int
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE CatProductType
  SET rowStatus = 0
  WHERE IDProductType = @IDProductType AND rowStatus = 1;

  IF @@ROWCOUNT = 0
  BEGIN
    ;THROW 51030, 'PRODUCT_TYPE_NOT_FOUND', 1;
  END
END
GO
