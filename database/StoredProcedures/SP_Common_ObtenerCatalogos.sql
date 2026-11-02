USE shopCart;
GO

CREATE OR ALTER PROCEDURE SP_Common_ObtenerCatalogos
AS
BEGIN
  SET NOCOUNT ON;

  SELECT IDProductType AS Id, ProductTypeName AS Name, ProductTypeDescription AS Description
  FROM CatProductType
  WHERE rowStatus = 1;

  SELECT IDCuponType AS Id, CuponTypeName AS Name, CuponTypeDescription AS Description
  FROM CatCuponType;

  SELECT RolePublicCode AS Id, RoleName AS Name, RoleDescription AS Description
  FROM Role;

  SELECT IDShippmentStatus AS Id, ShippmentStatusName AS Name, ShipmentStatusDescription AS Description
  FROM CatShippmentStatus;

  SELECT IDShipmmentMethod AS Id, ShippmentMethodCompanyName AS Name, ShippmentMethodDescription AS Description
  FROM CatShippmentMethod;

  SELECT IDReverseReason AS Id, ReverseReasonName AS Name, ReverseReasonDescription AS Description
  FROM CatReverseReason;
END
GO
