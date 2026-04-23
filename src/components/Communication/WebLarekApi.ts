import { IApi, IOrderRequest, IOrderResponse, IProductsResponse } from '../../types';

export class WebLarekApi {
    protected api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    getProducts(): Promise<IProductsResponse> {
        return this.api.get<IProductsResponse>('/product/');
    }

    createOrder(order: IOrderRequest): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>('/order/', order);
    }
}
