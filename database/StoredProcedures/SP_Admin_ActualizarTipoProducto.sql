USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ActualizarTipoProducto
  @IDProductType int,
  @ProductTypeName varchar(100),
  @ProductTypeDescription varchar(400)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE CatProductType
  SET ProductTypeName = @ProductTypeName,
      ProductTypeDescription = @ProductTypeDescription
  WHERE IDProductType = @IDProductType AND rowStatus = 1;

  IF @@ROWCOUNT = 0
  BEGIN
    ;THROW 51030, 'PRODUCT_TYPE_NOT_FOUND', 1;
  END
END
GO
