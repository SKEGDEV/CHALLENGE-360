USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_CrearTipoProducto
  @ProductTypeName varchar(100),
  @ProductTypeDescription varchar(400)
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO CatProductType (ProductTypeName, ProductTypeDescription, rowStatus)
  VALUES (@ProductTypeName, @ProductTypeDescription, 1);

  SELECT SCOPE_IDENTITY() AS IDProductType;
END
GO
