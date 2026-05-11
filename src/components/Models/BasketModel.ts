import { IProduct } from '../../types';
import { IEvents } from '../base/Events';
import { AppEvents } from '../../utils/events';

export class BasketModel {
    protected items: IProduct[];
    protected events?: IEvents;

    constructor(items: IProduct[] = [], events?: IEvents) {
        this.items = items;
        this.events = events;
    }

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(item: IProduct): void {
        this.items.push(item);
        this.events?.emit(AppEvents.BasketChanged);
    }

    removeItem(item: IProduct): void {
        this.items = this.items.filter((basketItem) => basketItem.id !== item.id);
        this.events?.emit(AppEvents.BasketChanged);
    }

    clear(): void {
        this.items = [];
        this.events?.emit(AppEvents.BasketChanged);
    }

    getTotal(): number {
        return this.items.reduce((total, item) => total + (item.price ?? 0), 0);
    }

    getCount(): number {
        return this.items.length;
    }

    hasItem(id: string): boolean {
        return this.items.some((item) => item.id === id);
    }
}
