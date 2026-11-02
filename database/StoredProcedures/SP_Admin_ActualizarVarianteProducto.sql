USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ActualizarVarianteProducto
  @IDVariant int,
  @SKU varchar(100),
  @Size varchar(50) = NULL,
  @Color varchar(100) = NULL,
  @Features varchar(400) = NULL,
  @Price decimal(18,2),
  @Quantity int,
  @IsDefault bit,
  @UpdatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM ProductVariant WHERE SKU = @SKU AND IDVariant <> @IDVariant)
  BEGIN
    ;THROW 51011, 'SKU_ALREADY_EXISTS', 1;
  END

  UPDATE ProductVariant
  SET SKU = @SKU,
      Size = @Size,
      Color = @Color,
      Features = @Features,
      Price = @Price,
      Quantity = @Quantity,
      isDefault = @IsDefault,
      VariantUserUpdatedBy = @UpdatedBy,
      VariantUserUpdatedAt = GETDATE()
  WHERE IDVariant = @IDVariant AND rowStatus = 1;
END
GO
