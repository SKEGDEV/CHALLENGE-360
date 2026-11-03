USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Client_ObtenerFacturas
  @IDUser int,
  @PageNumber int,
  @PageSize int,
  @IDShipmentStatus int = NULL,
  @DateFrom datetime = NULL,
  @DateTo datetime = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @TotalCount int;
  SELECT @TotalCount = COUNT(*)
  FROM Invoice
  WHERE IDUser = @IDUser
    AND (@IDShipmentStatus IS NULL OR IDShipmentStatus = @IDShipmentStatus)
    AND (@DateFrom IS NULL OR InvoiceDate >= @DateFrom)
    AND (@DateTo IS NULL OR InvoiceDate <= @DateTo);

  DECLARE @Page TABLE (IDInvoice int PRIMARY KEY);
  INSERT INTO @Page (IDInvoice)
  SELECT IDInvoice FROM Invoice
  WHERE IDUser = @IDUser
    AND (@IDShipmentStatus IS NULL OR IDShipmentStatus = @IDShipmentStatus)
    AND (@DateFrom IS NULL OR InvoiceDate >= @DateFrom)
    AND (@DateTo IS NULL OR InvoiceDate <= @DateTo)
  ORDER BY InvoiceDate DESC
  OFFSET (@PageNumber - 1) * @PageSize ROWS
  FETCH NEXT @PageSize ROWS ONLY;

  SELECT inv.IDInvoice, inv.InvoiceNumber, inv.DocumentNumber, inv.AddressLine1, inv.AddressLine2, inv.InvoiceDate,
         inv.IDShipmentStatus, s.ShippmentStatusName, inv.IDShippmmentMethod, sm.ShippmentMethodCompanyName,
         sm.ShipmentPrice, inv.ShippmentGuide, inv.isPayVDelivered,
         inv.IDCuponApplied, cp.CuponCode, ct.CuponTypeName, cp.CuponValue, cp.isPerCategory AS CuponIsPerCategory,
         @TotalCount AS TotalCount
  FROM Invoice inv
  INNER JOIN @Page pg ON pg.IDInvoice = inv.IDInvoice
  INNER JOIN CatShippmentStatus s ON s.IDShippmentStatus = inv.IDShipmentStatus
  INNER JOIN CatShippmentMethod sm ON sm.IDShipmmentMethod = inv.IDShippmmentMethod
  LEFT JOIN Cupon cp ON cp.IDCupon = inv.IDCuponApplied
  LEFT JOIN CatCuponType ct ON ct.IDCuponType = cp.IDCuponType
  ORDER BY inv.InvoiceDate DESC;

  SELECT ii.IDInvoice, ii.IDProductVariant, pv.SKU, p.ProductName, p.IDProductType, ii.Quantity, ii.PriceShiped, ii.isReversed
  FROM InvoiceItem ii
  INNER JOIN @Page pg ON pg.IDInvoice = ii.IDInvoice
  INNER JOIN ProductVariant pv ON pv.IDVariant = ii.IDProductVariant
  INNER JOIN Product p ON p.IDProduct = pv.IDProduct
  WHERE ii.rowStatus = 1;

  SELECT DISTINCT cpc.IDCupon, cpc.IDProductType
  FROM CuponPerCategory cpc
  INNER JOIN Invoice inv ON inv.IDCuponApplied = cpc.IDCupon
  INNER JOIN @Page pg ON pg.IDInvoice = inv.IDInvoice;
END
GO
