USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Admin_CrearArchivoVariante
  @IDProductVariant int,
  @FileName varchar(50),
  @FileBucketKey varchar(200),
  @FileContentType varchar(100),
  @CreatedBy int
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO StoredFile (IDProductVariant, FileName, FileBucketKey, FileContentType, FileUserCreatedBy, FileUserCreatedAt)
  VALUES (@IDProductVariant, @FileName, @FileBucketKey, @FileContentType, @CreatedBy, GETDATE());
END
GO
