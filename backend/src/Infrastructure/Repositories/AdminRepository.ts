import sql, { ConnectionPool } from 'mssql';
import {
  CreateCuponRequest,
  CuponDetail,
  CuponListItem,
  IAdminRepository,
  PaginatedResult,
  PaginationQuery,
  ProductCoreData,
  ProductDetailResponse,
  ProductTypeItem,
  ProductUpdatePlan,
  UpdateCuponRequest,
  UpdateProductTypeRequest,
  VariantDTO,
} from '@Core';

export class AdminRepository implements IAdminRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}

  private getPool(): ConnectionPool {
    if (!this.pool) {
      throw new Error('Database connection pool is not available');
    }
    return this.pool;
  }

  async createProduct(product: ProductCoreData, variants: VariantDTO[], createdBy: number): Promise<number> {
    const transaction = new sql.Transaction(this.getPool());
    await transaction.begin();

    try {
      const productRequest = new sql.Request(transaction);
      productRequest.input('IDProductType', product.idProductType);
      productRequest.input('ProductName', product.productName);
      productRequest.input('ProductDescription', product.productDescription);
      productRequest.input('ProductPublicCode', product.productPublicCode);
      productRequest.input('CreatedBy', createdBy);
      const productResult = await productRequest.execute('SP_Admin_CrearProducto');
      const idProduct = productResult.recordset[0].IDProduct as number;

      for (const variant of variants) {
        const variantRequest = new sql.Request(transaction);
        variantRequest.input('IDProduct', idProduct);
        variantRequest.input('SKU', variant.sku);
        variantRequest.input('Size', variant.size);
        variantRequest.input('Color', variant.color);
        variantRequest.input('Features', variant.features);
        variantRequest.input('Price', variant.price);
        variantRequest.input('Quantity', variant.quantity);
        variantRequest.input('IsDefault', variant.isDefault);
        variantRequest.input('CreatedBy', createdBy);
        const variantResult = await variantRequest.execute('SP_Admin_CrearVarianteProducto');
        const idVariant = variantResult.recordset[0].IDVariant as number;

        for (const photo of variant.photos) {
          const fileRequest = new sql.Request(transaction);
          fileRequest.input('IDProductVariant', idVariant);
          fileRequest.input('FileName', photo.fileName);
          fileRequest.input('FileBucketKey', photo.s3BucketKey);
          fileRequest.input('FileContentType', photo.fileContentType);
          fileRequest.input('CreatedBy', createdBy);
          await fileRequest.execute('SP_Admin_CrearArchivoVariante');
        }
      }

      await transaction.commit();
      return idProduct;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getProductDetail(idProduct: number): Promise<ProductDetailResponse | null> {
    const request = this.getPool().request();
    request.input('IDProduct', idProduct);
    const result = await request.execute('SP_Admin_ObtenerProductoDetalle');

    const [productRecordset, variantRecordset, fileRecordset] = result.recordsets as unknown as [
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
    ];

    const productRow = productRecordset[0];
    if (!productRow) {
      return null;
    }

    const filesByVariant = new Map<number, ProductDetailResponse['variants'][number]['photos']>();
    for (const row of fileRecordset) {
      const idVariant = row.IDProductVariant as number;
      const list = filesByVariant.get(idVariant) ?? [];
      list.push({
        idFile: row.IDFile as number,
        fileName: row.FileName as string,
        fileBucketKey: row.FileBucketKey as string,
        fileContentType: row.FileContentType as string,
      });
      filesByVariant.set(idVariant, list);
    }

    return {
      idProduct: productRow.IDProduct as number,
      idProductType: productRow.IDProductType as number,
      productName: productRow.ProductName as string,
      productDescription: productRow.ProductDescription as string,
      productPublicCode: productRow.ProductPublicCode as string,
      variants: variantRecordset.map((row) => ({
        idVariant: row.IDVariant as number,
        sku: row.SKU as string,
        size: (row.Size as string | null) ?? null,
        color: (row.Color as string | null) ?? null,
        features: (row.Features as string | null) ?? null,
        price: row.Price as number,
        quantity: row.Quantity as number,
        isDefault: Boolean(row.isDefault),
        photos: filesByVariant.get(row.IDVariant as number) ?? [],
      })),
    };
  }

  async updateProduct(
    idProduct: number,
    product: ProductCoreData,
    plan: ProductUpdatePlan,
    updatedBy: number,
  ): Promise<void> {
    const transaction = new sql.Transaction(this.getPool());
    await transaction.begin();

    try {
      const coreRequest = new sql.Request(transaction);
      coreRequest.input('IDProduct', idProduct);
      coreRequest.input('IDProductType', product.idProductType);
      coreRequest.input('ProductName', product.productName);
      coreRequest.input('ProductDescription', product.productDescription);
      coreRequest.input('UpdatedBy', updatedBy);
      await coreRequest.execute('SP_Admin_ActualizarProducto');

      for (const variant of plan.variantsToUpdate) {
        const variantRequest = new sql.Request(transaction);
        variantRequest.input('IDVariant', variant.idVariant);
        variantRequest.input('SKU', variant.sku);
        variantRequest.input('Size', variant.size);
        variantRequest.input('Color', variant.color);
        variantRequest.input('Features', variant.features);
        variantRequest.input('Price', variant.price);
        variantRequest.input('Quantity', variant.quantity);
        variantRequest.input('IsDefault', variant.isDefault);
        variantRequest.input('UpdatedBy', updatedBy);
        await variantRequest.execute('SP_Admin_ActualizarVarianteProducto');

        for (const photo of variant.newPhotos) {
          const fileRequest = new sql.Request(transaction);
          fileRequest.input('IDProductVariant', variant.idVariant);
          fileRequest.input('FileName', photo.fileName);
          fileRequest.input('FileBucketKey', photo.s3BucketKey);
          fileRequest.input('FileContentType', photo.fileContentType);
          fileRequest.input('CreatedBy', updatedBy);
          await fileRequest.execute('SP_Admin_CrearArchivoVariante');
        }
      }

      for (const variant of plan.variantsToCreate) {
        const variantRequest = new sql.Request(transaction);
        variantRequest.input('IDProduct', idProduct);
        variantRequest.input('SKU', variant.sku);
        variantRequest.input('Size', variant.size);
        variantRequest.input('Color', variant.color);
        variantRequest.input('Features', variant.features);
        variantRequest.input('Price', variant.price);
        variantRequest.input('Quantity', variant.quantity);
        variantRequest.input('IsDefault', variant.isDefault);
        variantRequest.input('CreatedBy', updatedBy);
        const variantResult = await variantRequest.execute('SP_Admin_CrearVarianteProducto');
        const idVariant = variantResult.recordset[0].IDVariant as number;

        for (const photo of variant.photos) {
          const fileRequest = new sql.Request(transaction);
          fileRequest.input('IDProductVariant', idVariant);
          fileRequest.input('FileName', photo.fileName);
          fileRequest.input('FileBucketKey', photo.s3BucketKey);
          fileRequest.input('FileContentType', photo.fileContentType);
          fileRequest.input('CreatedBy', updatedBy);
          await fileRequest.execute('SP_Admin_CrearArchivoVariante');
        }
      }

      if (plan.variantIdsToDeactivate.length > 0) {
        const deactivateRequest = new sql.Request(transaction);
        deactivateRequest.input('IDProduct', idProduct);
        deactivateRequest.input('VariantIdsJson', sql.NVarChar(sql.MAX), JSON.stringify(plan.variantIdsToDeactivate));
        deactivateRequest.input('UpdatedBy', updatedBy);
        await deactivateRequest.execute('SP_Admin_DesactivarVariantes');
      }

      if (plan.fileIdsToDelete.length > 0) {
        const deleteFilesRequest = new sql.Request(transaction);
        deleteFilesRequest.input('FileIdsJson', sql.NVarChar(sql.MAX), JSON.stringify(plan.fileIdsToDelete));
        await deleteFilesRequest.execute('SP_Admin_EliminarArchivosVariante');
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteProduct(idProduct: number, updatedBy: number): Promise<void> {
    const request = this.getPool().request();
    request.input('IDProduct', idProduct);
    request.input('UpdatedBy', updatedBy);
    await request.execute('SP_Admin_EliminarProducto');
  }

  async inactivateUser(idUser: number): Promise<void> {
    const request = this.getPool().request();
    request.input('IDUser', idUser);
    await request.execute('SP_Admin_InactivarUsuario');
  }

  async createCupon(data: CreateCuponRequest, createdBy: number): Promise<number> {
    const transaction = new sql.Transaction(this.getPool());
    await transaction.begin();

    try {
      const cuponRequest = new sql.Request(transaction);
      cuponRequest.input('IDCuponType', data.idCuponType);
      cuponRequest.input('CuponCode', data.cuponCode);
      cuponRequest.input('LimitUseTotal', data.limitUseTotal);
      cuponRequest.input('LimitUsePerClient', data.limitUsePerClient);
      cuponRequest.input('CuponValue', data.cuponValue);
      cuponRequest.input('CuponExpiration', new Date(data.cuponExpiration));
      cuponRequest.input('IsPerCategory', data.isPerCategory);
      cuponRequest.input('CreatedBy', createdBy);
      const cuponResult = await cuponRequest.execute('SP_Admin_CrearCupon');
      const idCupon = cuponResult.recordset[0].IDCupon as number;

      if (data.isPerCategory && data.categoryIds && data.categoryIds.length > 0) {
        const categoriesRequest = new sql.Request(transaction);
        categoriesRequest.input('IDCupon', idCupon);
        categoriesRequest.input('CategoryIdsJson', sql.NVarChar(sql.MAX), JSON.stringify(data.categoryIds));
        await categoriesRequest.execute('SP_Admin_SincronizarCategoriasCupon');
      }

      await transaction.commit();
      return idCupon;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getCupones(query: PaginationQuery): Promise<PaginatedResult<CuponListItem>> {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 20;

    const request = this.getPool().request();
    request.input('PageNumber', pageNumber);
    request.input('PageSize', pageSize);
    const result = await request.execute('SP_Admin_ObtenerCupones');

    const rows = result.recordset as Array<Record<string, unknown>>;
    const totalCount = rows.length > 0 ? Number(rows[0].TotalCount) : 0;

    return {
      items: rows.map((row) => ({
        idCupon: row.IDCupon as number,
        idCuponType: row.IDCuponType as number,
        cuponCode: row.CuponCode as string,
        limitUseTotal: row.limitUseTotal as number,
        limitUsePerClient: row.limitUsePerClient as number,
        cuponValue: row.CuponValue as number,
        cuponExpiration: row.CuponExpiration as Date,
        isPerCategory: Boolean(row.isPerCategory),
      })),
      pageNumber,
      pageSize,
      totalCount,
      totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0,
    };
  }

  async getCuponById(idCupon: number): Promise<CuponDetail | null> {
    const request = this.getPool().request();
    request.input('IDCupon', idCupon);
    const result = await request.execute('SP_Admin_ObtenerCuponPorId');

    const [cuponRecordset, categoryRecordset] = result.recordsets as unknown as [
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
    ];
    const row = cuponRecordset[0];
    if (!row) {
      return null;
    }

    return {
      idCupon: row.IDCupon as number,
      idCuponType: row.IDCuponType as number,
      cuponCode: row.CuponCode as string,
      limitUseTotal: row.limitUseTotal as number,
      limitUsePerClient: row.limitUsePerClient as number,
      cuponValue: row.CuponValue as number,
      cuponExpiration: row.CuponExpiration as Date,
      isPerCategory: Boolean(row.isPerCategory),
      categoryIds: categoryRecordset.map((categoryRow) => categoryRow.IDProductType as number),
    };
  }

  async updateCupon(idCupon: number, data: UpdateCuponRequest, updatedBy: number): Promise<void> {
    const transaction = new sql.Transaction(this.getPool());
    await transaction.begin();

    try {
      const cuponRequest = new sql.Request(transaction);
      cuponRequest.input('IDCupon', idCupon);
      cuponRequest.input('IDCuponType', data.idCuponType);
      cuponRequest.input('CuponCode', data.cuponCode);
      cuponRequest.input('LimitUseTotal', data.limitUseTotal);
      cuponRequest.input('LimitUsePerClient', data.limitUsePerClient);
      cuponRequest.input('CuponValue', data.cuponValue);
      cuponRequest.input('CuponExpiration', new Date(data.cuponExpiration));
      cuponRequest.input('IsPerCategory', data.isPerCategory);
      cuponRequest.input('UpdatedBy', updatedBy);
      await cuponRequest.execute('SP_Admin_ActualizarCupon');

      const categoriesRequest = new sql.Request(transaction);
      categoriesRequest.input('IDCupon', idCupon);
      categoriesRequest.input(
        'CategoryIdsJson',
        sql.NVarChar(sql.MAX),
        JSON.stringify(data.isPerCategory ? data.categoryIds ?? [] : []),
      );
      await categoriesRequest.execute('SP_Admin_SincronizarCategoriasCupon');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteCupon(idCupon: number, updatedBy: number): Promise<void> {
    const request = this.getPool().request();
    request.input('IDCupon', idCupon);
    request.input('UpdatedBy', updatedBy);
    await request.execute('SP_Admin_EliminarCupon');
  }

  async createProductType(data: { productTypeName: string; productTypeDescription: string }): Promise<number> {
    const request = this.getPool().request();
    request.input('ProductTypeName', data.productTypeName);
    request.input('ProductTypeDescription', data.productTypeDescription);
    const result = await request.execute('SP_Admin_CrearTipoProducto');
    return result.recordset[0].IDProductType as number;
  }

  async getProductTypes(): Promise<ProductTypeItem[]> {
    const request = this.getPool().request();
    const result = await request.execute('SP_Admin_ObtenerTiposProducto');
    return (result.recordset as Array<Record<string, unknown>>).map((row) => ({
      idProductType: row.IDProductType as number,
      productTypeName: row.ProductTypeName as string,
      productTypeDescription: row.ProductTypeDescription as string,
    }));
  }

  async getProductTypeById(idProductType: number): Promise<ProductTypeItem | null> {
    const request = this.getPool().request();
    request.input('IDProductType', idProductType);
    const result = await request.execute('SP_Admin_ObtenerTipoProductoPorId');
    const row = result.recordset[0];
    if (!row) {
      return null;
    }
    return {
      idProductType: row.IDProductType as number,
      productTypeName: row.ProductTypeName as string,
      productTypeDescription: row.ProductTypeDescription as string,
    };
  }

  async updateProductType(idProductType: number, data: UpdateProductTypeRequest): Promise<void> {
    const request = this.getPool().request();
    request.input('IDProductType', idProductType);
    request.input('ProductTypeName', data.productTypeName);
    request.input('ProductTypeDescription', data.productTypeDescription);
    await request.execute('SP_Admin_ActualizarTipoProducto');
  }

  async deleteProductType(idProductType: number): Promise<void> {
    const request = this.getPool().request();
    request.input('IDProductType', idProductType);
    await request.execute('SP_Admin_EliminarTipoProducto');
  }
}
