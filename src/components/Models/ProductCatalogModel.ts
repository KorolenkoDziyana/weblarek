import { IProduct } from '../../types';
import { IEvents } from '../base/Events';
import { AppEvents } from '../../utils/events';

export class ProductCatalogModel {
    protected items: IProduct[];
    protected preview: IProduct | null;
    protected events?: IEvents;

    constructor(items: IProduct[] = [], preview: IProduct | null = null, events?: IEvents) {
        this.items = items;
        this.preview = preview;
        this.events = events;
    }

    setItems(items: IProduct[]): void {
        this.items = items;
        this.events?.emit(AppEvents.CatalogChanged);
    }

    getItems(): IProduct[] {
        return this.items;
    }

    getItem(id: string): IProduct | undefined {
        return this.items.find((item) => item.id === id);
    }

    setPreview(item: IProduct): void {
        this.preview = item;
        this.events?.emit(AppEvents.PreviewChanged);
    }

    getPreview(): IProduct | null {
        return this.preview;
    }
}
