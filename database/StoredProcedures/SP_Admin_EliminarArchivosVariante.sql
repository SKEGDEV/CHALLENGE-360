USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_EliminarArchivosVariante
  @FileIdsJson nvarchar(max)
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM StoredFile
  WHERE IDFile IN (SELECT value FROM OPENJSON(@FileIdsJson));
END
GO
