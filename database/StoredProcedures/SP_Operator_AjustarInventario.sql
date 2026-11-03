USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Operator_AjustarInventario
  @IDUser int,
  @ItemsJson nvarchar(max)
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @Items TABLE (SKU varchar(100), QuantityToAdd int, MoveType varchar(20));
  INSERT INTO @Items (SKU, QuantityToAdd, MoveType)
  SELECT SKU, QuantityToAdd, MoveType
  FROM OPENJSON(@ItemsJson)
  WITH (SKU varchar(100) '$.sku', QuantityToAdd int '$.quantityToAdd', MoveType varchar(20) '$.type');

  IF EXISTS (
    SELECT 1 FROM @Items i
    LEFT JOIN ProductVariant pv ON pv.SKU = i.SKU AND pv.rowStatus = 1
    WHERE pv.IDVariant IS NULL
  )
  BEGIN
    ;THROW 51040, 'VARIANT_NOT_FOUND', 1;
  END

  BEGIN TRANSACTION;

  UPDATE pv
    SET pv.Quantity = pv.Quantity + (CASE WHEN i.MoveType = 'sumar' THEN i.QuantityToAdd ELSE -i.QuantityToAdd END)
  FROM ProductVariant pv
  INNER JOIN @Items i ON i.SKU = pv.SKU;

  IF EXISTS (SELECT 1 FROM ProductVariant pv INNER JOIN @Items i ON i.SKU = pv.SKU WHERE pv.Quantity < 0)
  BEGIN
    ROLLBACK TRANSACTION;
    ;THROW 51042, 'NEGATIVE_INVENTORY', 1;
  END

  INSERT INTO InventoryMove (IDUserMove, IDProductVariant, Quantity, moveType)
  SELECT @IDUser, pv.IDVariant, i.QuantityToAdd, CASE WHEN i.MoveType = 'sumar' THEN 'ENTRADA' ELSE 'SALIDA' END
  FROM @Items i
  INNER JOIN ProductVariant pv ON pv.SKU = i.SKU;

  COMMIT TRANSACTION;
END
GO
