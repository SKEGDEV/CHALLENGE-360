USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Client_CrearPreOrden
  @IDUser int,
  @IDShippmentMethod int,
  @AddressLine1 varchar(300),
  @AddressLine2 varchar(300) = NULL,
  @ItemsJson nvarchar(max)
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  IF NOT EXISTS (SELECT 1 FROM CatShippmentMethod WHERE IDShipmmentMethod = @IDShippmentMethod)
  BEGIN
    ;THROW 51050, 'SHIPPING_METHOD_NOT_FOUND', 1;
  END

  DECLARE @Items TABLE (IDProductVariant int, Quantity int);
  INSERT INTO @Items (IDProductVariant, Quantity)
  SELECT IDProductVariant, Quantity
  FROM OPENJSON(@ItemsJson)
  WITH (IDProductVariant int '$.idProductVariant', Quantity int '$.quantity');

  IF EXISTS (
    SELECT 1 FROM @Items i
    LEFT JOIN ProductVariant pv ON pv.IDVariant = i.IDProductVariant AND pv.rowStatus = 1
    WHERE pv.IDVariant IS NULL
  )
  BEGIN
    ;THROW 51040, 'VARIANT_NOT_FOUND', 1;
  END

  BEGIN TRANSACTION;

  DECLARE @Updated TABLE (IDVariant int);

  UPDATE pv
    SET pv.Quantity = pv.Quantity - i.Quantity
  OUTPUT inserted.IDVariant INTO @Updated
  FROM ProductVariant pv
  INNER JOIN @Items i ON i.IDProductVariant = pv.IDVariant
  WHERE pv.rowStatus = 1 AND pv.Quantity >= i.Quantity;

  IF (SELECT COUNT(*) FROM @Updated) <> (SELECT COUNT(*) FROM @Items)
  BEGIN
    ROLLBACK TRANSACTION;
    ;THROW 51041, 'INSUFFICIENT_STOCK', 1;
  END

  INSERT INTO Invoice (
    IDUser, InvoiceNumber, AddressLine1, AddressLine2, InvoiceDate, DocumentNumber,
    IDShipmentStatus, IDShippmmentMethod, IDCuponApplied, isPayVDelivered, isReversed,
    ReversedNotes, InvoiceUserUpdatedBy, InvoiceUserUpdatedAt, rowStatus, LastItemAddedAt
  )
  SELECT @IDUser, '', @AddressLine1, @AddressLine2, GETDATE(), '',
         s.IDShipmentStatus, @IDShippmentMethod, NULL, 0, 0,
         NULL, NULL, NULL, 1, GETDATE()
  FROM CatShippmentStatus s WHERE s.ShippmentStatusName = N'En pre orden';

  DECLARE @IDInvoice int = SCOPE_IDENTITY();

  UPDATE Invoice
  SET InvoiceNumber = 'INV-' + FORMAT(GETDATE(), 'yyyyMMdd') + '-' + RIGHT('000000' + CAST(@IDInvoice AS varchar(10)), 6),
      DocumentNumber = 'DOC-' + RIGHT('000000' + CAST(@IDInvoice AS varchar(10)), 6)
  WHERE IDInvoice = @IDInvoice;

  INSERT INTO InvoiceItem (IDInvoice, IDProductVariant, Quantity, PriceShiped, isReversed, IDReverseReason, rowStatus)
  SELECT @IDInvoice, i.IDProductVariant, i.Quantity, pv.Price, 0, NULL, 1
  FROM @Items i
  INNER JOIN ProductVariant pv ON pv.IDVariant = i.IDProductVariant;

  INSERT INTO InventoryMove (IDUserMove, IDProductVariant, Quantity, moveType)
  SELECT @IDUser, IDProductVariant, Quantity, 'RESERVA'
  FROM @Items;

  COMMIT TRANSACTION;

  SELECT IDInvoice, InvoiceNumber FROM Invoice WHERE IDInvoice = @IDInvoice;
END
GO
