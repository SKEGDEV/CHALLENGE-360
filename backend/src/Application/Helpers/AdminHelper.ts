import {
  IAdminHelper,
  IStorageService,
  PresignedFileRequest,
  PresignedFileResponseData,
  ProductDetailResponse,
  ProductUpdatePlan,
  UpdateProductRequest,
  VariantCreatePlanItem,
  VariantUpdatePlanItem,
} from '@Core';

export class AdminHelper implements IAdminHelper {
  constructor(private readonly storageService: IStorageService | undefined) {}

  private getStorageService(): IStorageService {
    if (!this.storageService) {
      throw new Error('Storage service is not available');
    }
    return this.storageService;
  }

  planProductUpdate(current: ProductDetailResponse, incoming: UpdateProductRequest): ProductUpdatePlan {
    const currentVariantsById = new Map(current.variants.map((variant) => [variant.idVariant, variant]));
    const incomingVariantIds = new Set(
      incoming.variants
        .filter((variant) => variant.idVariant !== undefined)
        .map((variant) => variant.idVariant as number),
    );

    const variantsToUpdate: VariantUpdatePlanItem[] = [];
    const variantsToCreate: VariantCreatePlanItem[] = [];
    const fileIdsToDelete: number[] = [];

    for (const variant of incoming.variants) {
      const currentVariant =
        variant.idVariant !== undefined ? currentVariantsById.get(variant.idVariant) : undefined;

      if (currentVariant) {
        const keptFileIds = new Set(
          variant.photos.filter((photo) => photo.idFile !== undefined).map((photo) => photo.idFile as number),
        );
        for (const currentPhoto of currentVariant.photos) {
          if (!keptFileIds.has(currentPhoto.idFile)) {
            fileIdsToDelete.push(currentPhoto.idFile);
          }
        }

        variantsToUpdate.push({
          idVariant: currentVariant.idVariant,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          features: variant.features,
          price: variant.price,
          quantity: variant.quantity,
          isDefault: variant.isDefault,
          newPhotos: variant.photos.filter((photo) => photo.idFile === undefined),
        });
      } else {
        variantsToCreate.push({
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          features: variant.features,
          price: variant.price,
          quantity: variant.quantity,
          isDefault: variant.isDefault,
          photos: variant.photos,
        });
      }
    }

    const variantIdsToDeactivate = current.variants
      .map((variant) => variant.idVariant)
      .filter((idVariant) => !incomingVariantIds.has(idVariant));

    return { variantsToUpdate, variantsToCreate, variantIdsToDeactivate, fileIdsToDelete };
  }

  async buildPresignedUrls(
    request: PresignedFileRequest,
    expiresInSeconds: number,
  ): Promise<PresignedFileResponseData> {
    const storage = this.getStorageService();

    const filesUrl = await Promise.all(
      request.files.map(async (file) => ({
        fileName: file.fileName,
        fileKey: file.fileKey,
        filePresignedUrl: await storage.getPresignedUploadUrl(file.fileKey, file.fileContentType, expiresInSeconds),
      })),
    );

    return { filesUrl, expiration: new Date(Date.now() + expiresInSeconds * 1000) };
  }
}
