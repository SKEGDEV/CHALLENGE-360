USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_SincronizarCategoriasCupon
  @IDCupon int,
  @CategoryIdsJson nvarchar(max)
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM CuponPerCategory WHERE IDCupon = @IDCupon;

  INSERT INTO CuponPerCategory (IDCupon, IDProductType)
  SELECT @IDCupon, value FROM OPENJSON(@CategoryIdsJson);
END
GO
