import { ConnectionPool } from 'mssql';
import {
  CatalogSnapshot,
  CatDTO,
  DashboardCategoryRow,
  DashboardRawResult,
  DashboardVariantRow,
  ICommonRepository,
  ProductSearchFilters,
  ProductSearchResult,
  RawFileRow,
  RawProductRow,
  RawVariantRow,
} from '@Core';

function mapDashboardVariantRows(rows: Array<Record<string, unknown>>): DashboardVariantRow[] {
  return rows.map((row) => ({
    idProduct: row.IDProduct as number,
    productName: row.ProductName as string,
    idVariant: row.IDVariant as number,
    sku: row.SKU as string,
    totalQuantity: Number(row.TotalQuantity),
  }));
}

function mapCatRows(rows: Array<Record<string, unknown>>): CatDTO[] {
  return rows.map((row) => ({
    id: row.Id as number | string,
    name: row.Name as string,
    description: row.Description as string,
  }));
}

export class CommonRepository implements ICommonRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}

  private getPool(): ConnectionPool {
    if (!this.pool) {
      throw new Error('Database connection pool is not available');
    }
    return this.pool;
  }

  async searchProducts(
    pageNumber: number,
    pageSize: number,
    filters: ProductSearchFilters,
  ): Promise<ProductSearchResult> {
    const request = this.getPool().request();
    request.input('PageNumber', pageNumber);
    request.input('PageSize', pageSize);
    request.input('IDProductType', filters.idProductType ?? null);
    request.input('ProductName', filters.productName ?? null);
    request.input('PriceFrom', filters.priceFrom ?? null);
    request.input('PriceTo', filters.priceTo ?? null);
    request.input('DateFrom', filters.from ?? null);
    request.input('DateTo', filters.to ?? null);

    const result = await request.execute('SP_Common_ObtenerProductos');
    const [productRecordset, variantRecordset, fileRecordset] = result.recordsets as unknown as [
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
    ];

    const totalCount = productRecordset.length > 0 ? Number(productRecordset[0].TotalCount) : 0;

    const products: RawProductRow[] = productRecordset.map((row) => ({
      idProduct: row.IDProduct as number,
      idProductType: row.IDProductType as number,
      productName: row.ProductName as string,
      productDescription: row.ProductDescription as string,
      productPublicCode: row.ProductPublicCode as string,
    }));

    const variants: RawVariantRow[] = variantRecordset.map((row) => ({
      idVariant: row.IDVariant as number,
      idProduct: row.IDProduct as number,
      sku: row.SKU as string,
      size: (row.Size as string | null) ?? null,
      color: (row.Color as string | null) ?? null,
      features: (row.Features as string | null) ?? null,
      price: row.Price as number,
      quantity: row.Quantity as number,
      isDefault: Boolean(row.isDefault),
    }));

    const files: RawFileRow[] = fileRecordset.map((row) => ({
      idProductVariant: row.IDProductVariant as number,
      fileBucketKey: row.FileBucketKey as string,
    }));

    return { products, variants, files, totalCount };
  }

  async getCatalogSnapshot(): Promise<CatalogSnapshot> {
    const request = this.getPool().request();
    const result = await request.execute('SP_Common_ObtenerCatalogos');
    const [productType, cuponType, role, shippmentStatus, shippmentMethod, reverseReason] =
      result.recordsets as Array<Array<Record<string, unknown>>>;

    return {
      CatProductType: mapCatRows(productType),
      CatCuponType: mapCatRows(cuponType),
      Role: mapCatRows(role),
      CatShippmentStatus: mapCatRows(shippmentStatus),
      CatShippmentMethod: mapCatRows(shippmentMethod),
      CatReverseReason: mapCatRows(reverseReason),
    };
  }

  async getDashboard(): Promise<DashboardRawResult> {
    const request = this.getPool().request();
    const result = await request.execute('SP_Common_ObtenerDashboard');
    const [mostShippedRecordset, leastShippedRecordset, categoryRecordset] = result.recordsets as Array<
      Array<Record<string, unknown>>
    >;

    const topCategories: DashboardCategoryRow[] = categoryRecordset.map((row) => ({
      idProductType: row.IDProductType as number,
      productTypeName: row.ProductTypeName as string,
      totalQuantity: Number(row.TotalQuantity),
    }));

    return {
      mostShipped: mapDashboardVariantRows(mostShippedRecordset),
      leastShipped: mapDashboardVariantRows(leastShippedRecordset),
      topCategories,
    };
  }
}
