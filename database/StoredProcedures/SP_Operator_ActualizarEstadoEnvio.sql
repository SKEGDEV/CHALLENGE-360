USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Operator_ActualizarEstadoEnvio
  @InvoiceNumber varchar(900),
  @DeliveryGuide varchar(70) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @IDInvoice int, @CurrentStatusName varchar(100);
  SELECT @IDInvoice = inv.IDInvoice, @CurrentStatusName = s.ShippmentStatusName
  FROM Invoice inv
  INNER JOIN CatShippmentStatus s ON s.IDShippmentStatus = inv.IDShipmentStatus
  WHERE inv.InvoiceNumber = @InvoiceNumber AND inv.rowStatus = 1;

  IF @IDInvoice IS NULL
  BEGIN
    ;THROW 51043, 'INVOICE_NOT_FOUND', 1;
  END

  DECLARE @NextStatusName varchar(100);

  IF @CurrentStatusName = N'A la espera de guia'
  BEGIN
    IF @DeliveryGuide IS NULL OR LTRIM(RTRIM(@DeliveryGuide)) = ''
    BEGIN
      ;THROW 51045, 'GUIDE_REQUIRED', 1;
    END
    SET @NextStatusName = N'Entregado a servicio delivery';
  END
  ELSE IF @CurrentStatusName = N'Entregado a servicio delivery'
  BEGIN
    SET @NextStatusName = N'Entregado al cliente final';
  END
  ELSE
  BEGIN
    ;THROW 51044, 'INVALID_STATUS_TRANSITION', 1;
  END

  UPDATE Invoice
  SET IDShipmentStatus = (SELECT IDShipmentStatus FROM CatShippmentStatus WHERE ShippmentStatusName = @NextStatusName),
      ShippmentGuide = ISNULL(@DeliveryGuide, ShippmentGuide),
      isPayVDelivered = CASE WHEN @NextStatusName = N'Entregado al cliente final' THEN 1 ELSE isPayVDelivered END
  WHERE IDInvoice = @IDInvoice;

  SELECT u.UserEmail, u.UserFirstName, inv.InvoiceNumber, inv.ShippmentGuide, @NextStatusName AS NewStatusName
  FROM Invoice inv
  INNER JOIN userSystem u ON u.IDUser = inv.IDUser
  WHERE inv.IDInvoice = @IDInvoice;
END
GO
