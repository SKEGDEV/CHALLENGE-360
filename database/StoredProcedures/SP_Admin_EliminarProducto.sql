USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_EliminarProducto
  @IDProduct int,
  @UpdatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRANSACTION;

  UPDATE Product
  SET rowStatus = 0,
      ProductUserUpdatedBy = @UpdatedBy,
      ProductUserUpdatedAt = GETDATE()
  WHERE IDProduct = @IDProduct;

  UPDATE ProductVariant
  SET rowStatus = 0,
      VariantUserUpdatedBy = @UpdatedBy,
      VariantUserUpdatedAt = GETDATE()
  WHERE IDProduct = @IDProduct AND rowStatus = 1;

  COMMIT TRANSACTION;
END
GO
