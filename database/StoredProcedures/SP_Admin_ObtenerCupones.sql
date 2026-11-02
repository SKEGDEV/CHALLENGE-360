USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_ObtenerCupones
  @PageNumber int,
  @PageSize int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    IDCupon, IDCuponType, CuponCode, limitUseTotal, limitUsePerClient, CuponValue, CuponExpiration, isPerCategory,
    COUNT(*) OVER() AS TotalCount
  FROM Cupon
  WHERE rowStatus = 1
  ORDER BY CuponUserCreatedAt DESC
  OFFSET (@PageNumber - 1) * @PageSize ROWS
  FETCH NEXT @PageSize ROWS ONLY;
END
GO
