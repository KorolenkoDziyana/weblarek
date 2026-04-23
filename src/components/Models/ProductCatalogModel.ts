import { IProduct } from '../../types';

export class ProductCatalogModel {
    protected items: IProduct[];
    protected preview: IProduct | null;

    constructor(items: IProduct[] = [], preview: IProduct | null = null) {
        this.items = items;
        this.preview = preview;
    }

    setItems(items: IProduct[]): void {
        this.items = items;
    }

    getItems(): IProduct[] {
        return this.items;
    }

    getItem(id: string): IProduct | undefined {
        return this.items.find((item) => item.id === id);
    }

    setPreview(item: IProduct): void {
        this.preview = item;
    }

    getPreview(): IProduct | null {
        return this.preview;
    }
}
