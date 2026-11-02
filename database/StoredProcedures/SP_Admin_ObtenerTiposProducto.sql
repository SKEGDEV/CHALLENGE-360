USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ObtenerTiposProducto
AS
BEGIN
  SET NOCOUNT ON;

  SELECT IDProductType, ProductTypeName, ProductTypeDescription
  FROM CatProductType
  WHERE rowStatus = 1
  ORDER BY ProductTypeName ASC;
END
GO
