USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_CrearVarianteProducto
  @IDProduct int,
  @SKU varchar(100),
  @Size varchar(50) = NULL,
  @Color varchar(100) = NULL,
  @Features varchar(400) = NULL,
  @Price decimal(18,2),
  @Quantity int,
  @IsDefault bit,
  @CreatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM ProductVariant WHERE SKU = @SKU)
  BEGIN
    ;THROW 51011, 'SKU_ALREADY_EXISTS', 1;
  END

  INSERT INTO ProductVariant (IDProduct, SKU, Size, Color, Features, Price, Quantity, isDefault, rowStatus, VariantUserCreatedBy, VariantUserCreatedAt)
  VALUES (@IDProduct, @SKU, @Size, @Color, @Features, @Price, @Quantity, @IsDefault, 1, @CreatedBy, GETDATE());

  SELECT SCOPE_IDENTITY() AS IDVariant;
END
GO
