USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ObtenerProductoDetalle
  @IDProduct int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT IDProduct, IDProductType, ProductName, ProductDescription, ProductPublicCode
  FROM Product
  WHERE IDProduct = @IDProduct AND rowStatus = 1;

  SELECT IDVariant, SKU, Size, Color, Features, Price, Quantity, isDefault
  FROM ProductVariant
  WHERE IDProduct = @IDProduct AND rowStatus = 1;

  SELECT sf.IDFile, sf.IDProductVariant, sf.FileName, sf.FileBucketKey, sf.FileContentType
  FROM StoredFile sf
  INNER JOIN ProductVariant pv ON pv.IDVariant = sf.IDProductVariant
  WHERE pv.IDProduct = @IDProduct AND pv.rowStatus = 1;
END
GO
