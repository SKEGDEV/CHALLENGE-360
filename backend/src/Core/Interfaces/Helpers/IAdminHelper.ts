import { PresignedFileRequest, PresignedFileResponseData, ProductDetailResponse, UpdateProductRequest } from '../../DTOs';
import { ProductUpdatePlan } from '../Repositories/IAdminRepository';

export interface IAdminHelper {
  planProductUpdate(current: ProductDetailResponse, incoming: UpdateProductRequest): ProductUpdatePlan;
  buildPresignedUrls(request: PresignedFileRequest, expiresInSeconds: number): Promise<PresignedFileResponseData>;
}
