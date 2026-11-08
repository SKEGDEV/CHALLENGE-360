USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Operator_ObtenerEnvios
  @PageNumber int,
  @PageSize int,
  @DateFrom datetime = NULL,
  @DateTo datetime = NULL,
  @IDShipmentStatus int = NULL,
  @IDShippmentMethod int = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @PreOrderStatus int = (SELECT IDShippmentStatus FROM CatShippmentStatus WHERE ShippmentStatusName = N'En pre orden');
  DECLARE @ExpiredStatus int = (SELECT IDShippmentStatus FROM CatShippmentStatus WHERE ShippmentStatusName = N'No transicionada');

  SELECT
    inv.IDInvoice, inv.InvoiceNumber, inv.DocumentNumber, inv.IDUser, inv.AddressLine1, inv.AddressLine2,
    inv.InvoiceDate, inv.IDShipmentStatus, s.ShippmentStatusName, inv.IDShippmmentMethod, sm.ShippmentMethodCompanyName,
    inv.ShippmentGuide, inv.isPayVDelivered,
    COUNT(*) OVER() AS TotalCount
  FROM Invoice inv
  INNER JOIN CatShippmentStatus s ON s.IDShippmentStatus = inv.IDShipmentStatus
  INNER JOIN CatShippmentMethod sm ON sm.IDShipmmentMethod = inv.IDShippmmentMethod
  WHERE inv.rowStatus = 1
    AND inv.IDShipmentStatus NOT IN (@PreOrderStatus, @ExpiredStatus)
    AND (@IDShipmentStatus IS NULL OR inv.IDShipmentStatus = @IDShipmentStatus)
    AND (@IDShippmentMethod IS NULL OR inv.IDShippmmentMethod = @IDShippmentMethod)
    AND (@DateFrom IS NULL OR inv.InvoiceDate >= @DateFrom)
    AND (@DateTo IS NULL OR inv.InvoiceDate <= @DateTo)
  ORDER BY inv.InvoiceDate DESC
  OFFSET (@PageNumber - 1) * @PageSize ROWS
  FETCH NEXT @PageSize ROWS ONLY;
END
GO
