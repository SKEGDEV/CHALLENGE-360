import {
  AddPreOrderItemRequest,
  ConfirmShipmentRequest,
  ConfirmShipmentResponseData,
  CreatePreOrderRequest,
  CreatePreOrderResponseData,
  CustomException,
  ErrorDictionary,
  IClientHelper,
  IClientRepository,
  IClientService,
  ICommonHelper,
  InvoiceDetailResponse,
  InvoiceListQuery,
  InvoiceListResponseData,
  ISettings,
  StandardResponse,
  SuccessDictionary,
} from '@Core';

function mapRepositoryError(error: unknown): never {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('SHIPPING_METHOD_NOT_FOUND')) {
    throw new CustomException(404, 'CLI0009', ErrorDictionary.CLI0009);
  }
  if (message.includes('VARIANT_NOT_FOUND')) {
    throw new CustomException(404, 'CLI0001', ErrorDictionary.CLI0001);
  }
  if (message.includes('INSUFFICIENT_STOCK')) {
    throw new CustomException(409, 'CLI0002', ErrorDictionary.CLI0002);
  }
  if (message.includes('INVOICE_NOT_FOUND')) {
    throw new CustomException(404, 'CLI0003', ErrorDictionary.CLI0003);
  }
  if (message.includes('PREORDER_NOT_MODIFIABLE')) {
    throw new CustomException(409, 'CLI0004', ErrorDictionary.CLI0004);
  }
  if (message.includes('CUPON_NOT_FOUND')) {
    throw new CustomException(404, 'CLI0005', ErrorDictionary.CLI0005);
  }
  if (message.includes('CUPON_EXPIRED')) {
    throw new CustomException(409, 'CLI0006', ErrorDictionary.CLI0006);
  }
  if (message.includes('CUPON_LIMIT_REACHED')) {
    throw new CustomException(409, 'CLI0007', ErrorDictionary.CLI0007);
  }
  if (message.includes('PREORDER_EMPTY')) {
    throw new CustomException(409, 'CLI0010', ErrorDictionary.CLI0010);
  }

  throw error;
}

export class ClientService implements IClientService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly clientHelper: IClientHelper,
    private readonly commonHelper: ICommonHelper,
    private readonly settings: ISettings,
  ) {}

  async createPreOrder(
    idUser: number,
    data: CreatePreOrderRequest,
  ): Promise<StandardResponse<CreatePreOrderResponseData>> {
    const result = await this.clientRepository
      .createPreOrder(idUser, {
        idShippmentMethod: data.idShippmentMethod,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        items: data.items,
      })
      .catch(mapRepositoryError);

    return this.commonHelper.buildResponse(200, result, SuccessDictionary.OK0013);
  }

  async addPreOrderItem(
    idUser: number,
    idInvoice: number,
    data: AddPreOrderItemRequest,
  ): Promise<StandardResponse<null>> {
    await this.clientRepository.addPreOrderItem(idInvoice, idUser, data).catch(mapRepositoryError);
    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0014);
  }

  async confirmShipment(
    idUser: number,
    idInvoice: number,
    data: ConfirmShipmentRequest,
  ): Promise<StandardResponse<ConfirmShipmentResponseData>> {
    await this.clientRepository
      .confirmShipment(idInvoice, idUser, data.cuponCode ?? null)
      .catch(mapRepositoryError);

    const detail = await this.clientRepository.getInvoiceDetail(idInvoice, idUser);
    if (!detail) {
      throw new CustomException(404, 'CLI0008', ErrorDictionary.CLI0008);
    }

    const totals = this.clientHelper.computeInvoiceTotals(
      detail.header,
      detail.items,
      detail.cuponCategories,
      this.settings.taxIvaPercentage,
    );

    return this.commonHelper.buildResponse(
      200,
      { idInvoice: detail.header.idInvoice, invoiceNumber: detail.header.invoiceNumber, ...totals },
      SuccessDictionary.OK0015,
    );
  }

  async getInvoices(idUser: number, query: InvoiceListQuery): Promise<StandardResponse<InvoiceListResponseData>> {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.clientRepository.getInvoices(idUser, pageNumber, pageSize, {
      idShipmentStatus: query.idShipmentStatus,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    const itemsByInvoice = new Map<number, typeof result.items>();
    for (const item of result.items) {
      const list = itemsByInvoice.get(item.idInvoice) ?? [];
      list.push(item);
      itemsByInvoice.set(item.idInvoice, list);
    }

    const items = result.headers.map((header) =>
      this.clientHelper.mapInvoiceListItem(
        header,
        itemsByInvoice.get(header.idInvoice) ?? [],
        result.cuponCategories,
        this.settings.taxIvaPercentage,
      ),
    );

    return this.commonHelper.buildResponse(
      200,
      { items, pageNumber, pageSize, totalCount: result.totalCount, totalPages: pageSize > 0 ? Math.ceil(result.totalCount / pageSize) : 0 },
      SuccessDictionary.OK0006,
    );
  }

  async getInvoiceDetail(idUser: number, idInvoice: number): Promise<StandardResponse<InvoiceDetailResponse>> {
    const detail = await this.clientRepository.getInvoiceDetail(idInvoice, idUser);
    if (!detail) {
      throw new CustomException(404, 'CLI0008', ErrorDictionary.CLI0008);
    }

    const data = this.clientHelper.mapInvoiceDetail(
      detail.header,
      detail.items,
      detail.cuponCategories,
      this.settings.taxIvaPercentage,
    );

    return this.commonHelper.buildResponse(200, data, SuccessDictionary.OK0007);
  }

  async releaseExpiredPreOrders(): Promise<number> {
    return this.clientRepository.releaseExpiredPreOrders(this.settings.preOrderExpirationMinutes);
  }
}
