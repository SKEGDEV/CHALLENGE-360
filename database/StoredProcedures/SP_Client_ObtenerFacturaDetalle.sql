USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Client_ObtenerFacturaDetalle
  @IDInvoice int,
  @IDUser int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT inv.IDInvoice, inv.InvoiceNumber, inv.DocumentNumber, inv.AddressLine1, inv.AddressLine2, inv.InvoiceDate,
         inv.IDShipmentStatus, s.ShippmentStatusName, inv.IDShippmmentMethod, sm.ShippmentMethodCompanyName,
         sm.ShipmentPrice, inv.ShippmentGuide, inv.isPayVDelivered,
         inv.IDCuponApplied, cp.CuponCode, ct.CuponTypeName, cp.CuponValue, cp.isPerCategory AS CuponIsPerCategory
  FROM Invoice inv
  INNER JOIN CatShippmentStatus s ON s.IDShippmentStatus = inv.IDShipmentStatus
  INNER JOIN CatShippmentMethod sm ON sm.IDShipmmentMethod = inv.IDShippmmentMethod
  LEFT JOIN Cupon cp ON cp.IDCupon = inv.IDCuponApplied
  LEFT JOIN CatCuponType ct ON ct.IDCuponType = cp.IDCuponType
  WHERE inv.IDInvoice = @IDInvoice AND inv.IDUser = @IDUser;

  SELECT ii.IDInvoice, ii.IDProductVariant, pv.SKU, p.ProductName, p.IDProductType, ii.Quantity, ii.PriceShiped, ii.isReversed
  FROM InvoiceItem ii
  INNER JOIN ProductVariant pv ON pv.IDVariant = ii.IDProductVariant
  INNER JOIN Product p ON p.IDProduct = pv.IDProduct
  WHERE ii.IDInvoice = @IDInvoice AND ii.rowStatus = 1;

  SELECT cpc.IDCupon, cpc.IDProductType
  FROM CuponPerCategory cpc
  INNER JOIN Invoice inv ON inv.IDCuponApplied = cpc.IDCupon
  WHERE inv.IDInvoice = @IDInvoice;
END
GO
