USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_CrearProducto
  @IDProductType int,
  @ProductName varchar(100),
  @ProductDescription varchar(600),
  @ProductPublicCode varchar(50),
  @CreatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM Product WHERE ProductPublicCode = @ProductPublicCode)
  BEGIN
    ;THROW 51010, 'PRODUCT_PUBLIC_CODE_EXISTS', 1;
  END

  INSERT INTO Product (IDProductType, ProductName, ProductDescription, ProductUserCreatedBy, ProductUserCreatedAt, ProductPublicCode, rowStatus)
  VALUES (@IDProductType, @ProductName, @ProductDescription, @CreatedBy, GETDATE(), @ProductPublicCode, 1);

  SELECT SCOPE_IDENTITY() AS IDProduct;
END
GO
