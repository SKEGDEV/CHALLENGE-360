USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ObtenerTipoProductoPorId
  @IDProductType int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT IDProductType, ProductTypeName, ProductTypeDescription
  FROM CatProductType
  WHERE IDProductType = @IDProductType AND rowStatus = 1;
END
GO
