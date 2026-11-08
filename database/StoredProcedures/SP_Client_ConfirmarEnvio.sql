USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Client_ConfirmarEnvio
  @IDInvoice int,
  @IDUser int,
  @CuponCode varchar(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @StatusName varchar(100);
  SELECT @StatusName = s.ShippmentStatusName
  FROM Invoice inv
  INNER JOIN CatShippmentStatus s ON s.IDShippmentStatus = inv.IDShipmentStatus
  WHERE inv.IDInvoice = @IDInvoice AND inv.IDUser = @IDUser AND inv.rowStatus = 1;

  IF @StatusName IS NULL
  BEGIN
    ;THROW 51043, 'INVOICE_NOT_FOUND', 1;
  END

  IF @StatusName <> N'En pre orden'
  BEGIN
    ;THROW 51049, 'PREORDER_NOT_MODIFIABLE', 1;
  END

  IF NOT EXISTS (SELECT 1 FROM InvoiceItem WHERE IDInvoice = @IDInvoice AND rowStatus = 1 AND isReversed = 0)
  BEGIN
    ;THROW 51051, 'PREORDER_EMPTY', 1;
  END

  DECLARE @IDCupon int = NULL;

  IF @CuponCode IS NOT NULL
  BEGIN
    DECLARE @LimitUseTotal int, @LimitUsePerClient int;

    SELECT @IDCupon = IDCupon, @LimitUseTotal = limitUseTotal, @LimitUsePerClient = limitUsePerClient
    FROM Cupon
    WHERE CuponCode = @CuponCode AND rowStatus = 1;

    IF @IDCupon IS NULL
    BEGIN
      ;THROW 51046, 'CUPON_NOT_FOUND', 1;
    END

    IF EXISTS (SELECT 1 FROM Cupon WHERE IDCupon = @IDCupon AND CuponExpiration < GETDATE())
    BEGIN
      ;THROW 51047, 'CUPON_EXPIRED', 1;
    END

    DECLARE @NoTransicionadaStatus int = (SELECT IDShippmentStatus FROM CatShippmentStatus WHERE ShippmentStatusName = N'No transicionada');
    DECLARE @UsedTotal int, @UsedByClient int;

    SELECT @UsedTotal = COUNT(*)
    FROM Invoice
    WHERE IDCuponApplied = @IDCupon AND rowStatus = 1 AND IDShipmentStatus <> @NoTransicionadaStatus;

    SELECT @UsedByClient = COUNT(*)
    FROM Invoice
    WHERE IDCuponApplied = @IDCupon AND rowStatus = 1 AND IDUser = @IDUser AND IDShipmentStatus <> @NoTransicionadaStatus;

    IF @UsedTotal >= @LimitUseTotal OR @UsedByClient >= @LimitUsePerClient
    BEGIN
      ;THROW 51048, 'CUPON_LIMIT_REACHED', 1;
    END
  END

  UPDATE Invoice
  SET IDShipmentStatus = (SELECT IDShippmentStatus FROM CatShippmentStatus WHERE ShippmentStatusName = N'A la espera de guia'),
      IDCuponApplied = @IDCupon
  WHERE IDInvoice = @IDInvoice;
END
GO
