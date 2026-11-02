USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Common_ObtenerProductos
  @PageNumber int,
  @PageSize int,
  @IDProductType int = NULL,
  @ProductName varchar(100) = NULL,
  @PriceFrom decimal(18,2) = NULL,
  @PriceTo decimal(18,2) = NULL,
  @DateFrom datetime = NULL,
  @DateTo datetime = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @FilteredProducts TABLE (IDProduct int PRIMARY KEY, ProductUserCreatedAt datetime);

  INSERT INTO @FilteredProducts (IDProduct, ProductUserCreatedAt)
  SELECT p.IDProduct, p.ProductUserCreatedAt
  FROM Product p
  WHERE p.rowStatus = 1
    AND (@IDProductType IS NULL OR p.IDProductType = @IDProductType)
    AND (@ProductName IS NULL OR p.ProductName LIKE '%' + @ProductName + '%')
    AND (@DateFrom IS NULL OR p.ProductUserCreatedAt >= @DateFrom)
    AND (@DateTo IS NULL OR p.ProductUserCreatedAt <= @DateTo)
    AND (
      (@PriceFrom IS NULL AND @PriceTo IS NULL)
      OR EXISTS (
        SELECT 1 FROM ProductVariant pv
        WHERE pv.IDProduct = p.IDProduct AND pv.rowStatus = 1
          AND (@PriceFrom IS NULL OR pv.Price >= @PriceFrom)
          AND (@PriceTo IS NULL OR pv.Price <= @PriceTo)
      )
    );

  DECLARE @TotalCount int = (SELECT COUNT(*) FROM @FilteredProducts);

  DECLARE @PageProducts TABLE (IDProduct int PRIMARY KEY);

  INSERT INTO @PageProducts (IDProduct)
  SELECT IDProduct
  FROM @FilteredProducts
  ORDER BY ProductUserCreatedAt DESC
  OFFSET (@PageNumber - 1) * @PageSize ROWS
  FETCH NEXT @PageSize ROWS ONLY;

  SELECT p.IDProduct, p.IDProductType, p.ProductName, p.ProductDescription, p.ProductPublicCode, @TotalCount AS TotalCount
  FROM Product p
  INNER JOIN @PageProducts pp ON pp.IDProduct = p.IDProduct
  ORDER BY p.ProductUserCreatedAt DESC;

  SELECT pv.IDVariant, pv.IDProduct, pv.SKU, pv.Size, pv.Color, pv.Features, pv.Price, pv.Quantity, pv.isDefault
  FROM ProductVariant pv
  INNER JOIN @PageProducts pp ON pp.IDProduct = pv.IDProduct
  WHERE pv.rowStatus = 1;

  SELECT sf.IDProductVariant, sf.FileBucketKey
  FROM StoredFile sf
  INNER JOIN ProductVariant pv ON pv.IDVariant = sf.IDProductVariant
  INNER JOIN @PageProducts pp ON pp.IDProduct = pv.IDProduct
  WHERE pv.rowStatus = 1;
END
GO
