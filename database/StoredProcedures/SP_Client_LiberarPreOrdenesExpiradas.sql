USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Client_LiberarPreOrdenesExpiradas
  @ExpirationMinutes int
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @PreOrderStatus int = (SELECT IDShippmentStatus FROM CatShippmentStatus WHERE ShippmentStatusName = N'En pre orden');
  DECLARE @ExpiredStatus int = (SELECT IDShippmentStatus FROM CatShippmentStatus WHERE ShippmentStatusName = N'No transicionada');

  DECLARE @Expired TABLE (IDInvoice int PRIMARY KEY);
  INSERT INTO @Expired (IDInvoice)
  SELECT IDInvoice
  FROM Invoice
  WHERE IDShipmentStatus = @PreOrderStatus
    AND rowStatus = 1
    AND LastItemAddedAt IS NOT NULL
    AND LastItemAddedAt <= DATEADD(MINUTE, -@ExpirationMinutes, GETDATE());

  IF NOT EXISTS (SELECT 1 FROM @Expired)
  BEGIN
    SELECT 0 AS ReleasedCount;
    RETURN;
  END

  BEGIN TRANSACTION;

  UPDATE pv
    SET pv.Quantity = pv.Quantity + ii.Quantity
  FROM ProductVariant pv
  INNER JOIN InvoiceItem ii ON ii.IDProductVariant = pv.IDVariant
  INNER JOIN @Expired e ON e.IDInvoice = ii.IDInvoice
  WHERE ii.rowStatus = 1 AND ii.isReversed = 0;

  INSERT INTO InventoryMove (IDUserMove, IDProductVariant, Quantity, moveType)
  SELECT inv.IDUser, ii.IDProductVariant, ii.Quantity, 'LIBERACION'
  FROM InvoiceItem ii
  INNER JOIN @Expired e ON e.IDInvoice = ii.IDInvoice
  INNER JOIN Invoice inv ON inv.IDInvoice = ii.IDInvoice
  WHERE ii.rowStatus = 1 AND ii.isReversed = 0;

  UPDATE InvoiceItem
  SET rowStatus = 0
  WHERE IDInvoice IN (SELECT IDInvoice FROM @Expired);

  UPDATE Invoice
  SET IDShipmentStatus = @ExpiredStatus, rowStatus = 0
  WHERE IDInvoice IN (SELECT IDInvoice FROM @Expired);

  COMMIT TRANSACTION;

  SELECT COUNT(*) AS ReleasedCount FROM @Expired;
END
GO
