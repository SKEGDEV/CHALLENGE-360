USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ObtenerCuponPorId
  @IDCupon int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT IDCupon, IDCuponType, CuponCode, limitUseTotal, limitUsePerClient, CuponValue, CuponExpiration, isPerCategory
  FROM Cupon
  WHERE IDCupon = @IDCupon AND rowStatus = 1;

  SELECT IDProductType
  FROM CuponPerCategory
  WHERE IDCupon = @IDCupon;
END
GO
