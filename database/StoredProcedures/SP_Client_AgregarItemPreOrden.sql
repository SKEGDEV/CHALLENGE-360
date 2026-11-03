USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Client_AgregarItemPreOrden
  @IDInvoice int,
  @IDUser int,
  @IDProductVariant int,
  @Quantity int
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @CurrentStatusName varchar(100);
  SELECT @CurrentStatusName = s.ShippmentStatusName
  FROM Invoice inv
  INNER JOIN CatShippmentStatus s ON s.IDShippmentStatus = inv.IDShipmentStatus
  WHERE inv.IDInvoice = @IDInvoice AND inv.IDUser = @IDUser AND inv.rowStatus = 1;

  IF @CurrentStatusName IS NULL
  BEGIN
    ;THROW 51043, 'INVOICE_NOT_FOUND', 1;
  END

  IF @CurrentStatusName <> N'En pre orden'
  BEGIN
    ;THROW 51049, 'PREORDER_NOT_MODIFIABLE', 1;
  END

  IF NOT EXISTS (SELECT 1 FROM ProductVariant WHERE IDVariant = @IDProductVariant AND rowStatus = 1)
  BEGIN
    ;THROW 51040, 'VARIANT_NOT_FOUND', 1;
  END

  BEGIN TRANSACTION;

  UPDATE ProductVariant
  SET Quantity = Quantity - @Quantity
  WHERE IDVariant = @IDProductVariant AND rowStatus = 1 AND Quantity >= @Quantity;

  IF @@ROWCOUNT = 0
  BEGIN
    ROLLBACK TRANSACTION;
    ;THROW 51041, 'INSUFFICIENT_STOCK', 1;
  END

  INSERT INTO InvoiceItem (IDInvoice, IDProductVariant, Quantity, PriceShiped, isReversed, IDReverseReason, rowStatus)
  SELECT @IDInvoice, @IDProductVariant, @Quantity, Price, 0, NULL, 1
  FROM ProductVariant WHERE IDVariant = @IDProductVariant;

  INSERT INTO InventoryMove (IDUserMove, IDProductVariant, Quantity, moveType)
  VALUES (@IDUser, @IDProductVariant, @Quantity, 'RESERVA');

  UPDATE Invoice SET LastItemAddedAt = GETDATE() WHERE IDInvoice = @IDInvoice;

  COMMIT TRANSACTION;
END
GO
