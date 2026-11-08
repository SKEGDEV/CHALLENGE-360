USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Common_ObtenerDashboard
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @ShippedStatuses TABLE (IDShipmentStatus int);
  INSERT INTO @ShippedStatuses (IDShipmentStatus)
  SELECT IDShippmentStatus FROM CatShippmentStatus
  WHERE ShippmentStatusName IN (N'Entregado a servicio delivery', N'Entregado al cliente final');

  DECLARE @ShippedByVariant TABLE (IDVariant int PRIMARY KEY, TotalQuantity int);
  INSERT INTO @ShippedByVariant (IDVariant, TotalQuantity)
  SELECT pv.IDVariant, ISNULL(SUM(ii.Quantity), 0)
  FROM ProductVariant pv
  LEFT JOIN InvoiceItem ii ON ii.IDProductVariant = pv.IDVariant AND ii.rowStatus = 1 AND ii.isReversed = 0
  LEFT JOIN Invoice inv ON inv.IDInvoice = ii.IDInvoice AND inv.rowStatus = 1
    AND inv.IDShipmentStatus IN (SELECT IDShipmentStatus FROM @ShippedStatuses)
  WHERE pv.rowStatus = 1
  GROUP BY pv.IDVariant;

  -- Mas vendidos (top 5)
  SELECT TOP 5 p.IDProduct, p.ProductName, pv.IDVariant, pv.SKU, s.TotalQuantity
  FROM @ShippedByVariant s
  INNER JOIN ProductVariant pv ON pv.IDVariant = s.IDVariant
  INNER JOIN Product p ON p.IDProduct = pv.IDProduct
  ORDER BY s.TotalQuantity DESC, p.ProductName ASC;

  -- Menos vendidos (top 5, incluye productos sin ventas)
  SELECT TOP 5 p.IDProduct, p.ProductName, pv.IDVariant, pv.SKU, s.TotalQuantity
  FROM @ShippedByVariant s
  INNER JOIN ProductVariant pv ON pv.IDVariant = s.IDVariant
  INNER JOIN Product p ON p.IDProduct = pv.IDProduct
  ORDER BY s.TotalQuantity ASC, p.ProductName ASC;

  -- Categorias con mas unidades vendidas (top 5)
  SELECT TOP 5 pt.IDProductType, pt.ProductTypeName, ISNULL(SUM(ii.Quantity), 0) AS TotalQuantity
  FROM CatProductType pt
  LEFT JOIN Product p ON p.IDProductType = pt.IDProductType AND p.rowStatus = 1
  LEFT JOIN ProductVariant pv ON pv.IDProduct = p.IDProduct AND pv.rowStatus = 1
  LEFT JOIN InvoiceItem ii ON ii.IDProductVariant = pv.IDVariant AND ii.rowStatus = 1 AND ii.isReversed = 0
  LEFT JOIN Invoice inv ON inv.IDInvoice = ii.IDInvoice AND inv.rowStatus = 1
    AND inv.IDShipmentStatus IN (SELECT IDShipmentStatus FROM @ShippedStatuses)
  WHERE pt.rowStatus = 1
  GROUP BY pt.IDProductType, pt.ProductTypeName
  ORDER BY TotalQuantity DESC;
END
GO
