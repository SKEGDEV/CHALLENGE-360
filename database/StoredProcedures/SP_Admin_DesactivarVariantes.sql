USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_DesactivarVariantes
  @IDProduct int,
  @VariantIdsJson nvarchar(max),
  @UpdatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE ProductVariant
  SET rowStatus = 0,
      VariantUserUpdatedBy = @UpdatedBy,
      VariantUserUpdatedAt = GETDATE()
  WHERE IDProduct = @IDProduct
    AND rowStatus = 1
    AND IDVariant IN (SELECT value FROM OPENJSON(@VariantIdsJson));
END
GO
