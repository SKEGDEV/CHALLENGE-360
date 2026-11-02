USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ActualizarProducto
  @IDProduct int,
  @IDProductType int,
  @ProductName varchar(100),
  @ProductDescription varchar(600),
  @UpdatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE Product
  SET IDProductType = @IDProductType,
      ProductName = @ProductName,
      ProductDescription = @ProductDescription,
      ProductUserUpdatedBy = @UpdatedBy,
      ProductUserUpdatedAt = GETDATE()
  WHERE IDProduct = @IDProduct AND rowStatus = 1;

  IF @@ROWCOUNT = 0
  BEGIN
    ;THROW 51012, 'PRODUCT_NOT_FOUND', 1;
  END
END
GO
