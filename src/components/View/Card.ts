import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { IProduct, ProductActionEvent, ProductEvent } from '../../types';
import { CDN_URL, categoryMap } from '../../utils/constants';
import { AppEvents } from '../../utils/events';
import { formatPrice, setCategoryClass, setDisabled, setText } from './helpers';

type CategoryName = keyof typeof categoryMap;

export type CatalogCardData = Pick<IProduct, 'id' | 'title' | 'category' | 'image' | 'price'>;
export type PreviewCardData = IProduct & {
    inBasket: boolean;
};
export type BasketCardData = Pick<IProduct, 'id' | 'title' | 'price'> & {
    index: number;
};

export abstract class Card<T> extends Component<T> {
    protected title: HTMLElement;
    protected price: HTMLElement;

    protected constructor(container: HTMLElement) {
        super(container);
        this.title = container.querySelector('.card__title') as HTMLElement;
        this.price = container.querySelector('.card__price') as HTMLElement;
    }

    protected setTitle(value: string): void {
        setText(this.title, value);
    }

    protected setPrice(value: number | null): void {
        setText(this.price, formatPrice(value));
    }

    protected getImageUrl(image: string): string {
        return `${CDN_URL}${image}`;
    }
}

export class CatalogCard extends Card<CatalogCardData> {
    protected image: HTMLImageElement;
    protected category: HTMLElement;
    protected id = '';

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.image = container.querySelector('.card__image') as HTMLImageElement;
        this.category = container.querySelector('.card__category') as HTMLElement;

        this.container.addEventListener('click', () => {
            this.events.emit<ProductEvent>(AppEvents.CardSelect, { id: this.id });
        });
    }

    render(data: CatalogCardData): HTMLElement {
        this.id = data.id;
        this.setTitle(data.title);
        this.setPrice(data.price);
        this.setImage(this.image, this.getImageUrl(data.image), data.title);
        setText(this.category, data.category);
        setCategoryClass(this.category, categoryMap[data.category as CategoryName]);
        return this.container;
    }
}

export class PreviewCard extends Card<PreviewCardData> {
    protected image: HTMLImageElement;
    protected category: HTMLElement;
    protected description: HTMLElement;
    protected button: HTMLButtonElement;
    protected item: IProduct | null = null;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.image = container.querySelector('.card__image') as HTMLImageElement;
        this.category = container.querySelector('.card__category') as HTMLElement;
        this.description = container.querySelector('.card__text') as HTMLElement;
        this.button = container.querySelector('.card__button') as HTMLButtonElement;

        this.button.addEventListener('click', () => {
            if (this.item) {
                this.events.emit<ProductActionEvent>(AppEvents.ProductToggle, { item: this.item });
            }
        });
    }

    render(data: PreviewCardData): HTMLElement {
        this.item = data;
        this.setTitle(data.title);
        this.setPrice(data.price);
        this.setImage(this.image, this.getImageUrl(data.image), data.title);
        setText(this.category, data.category);
        setText(this.description, data.description);
        setCategoryClass(this.category, categoryMap[data.category as CategoryName]);

        if (data.price === null) {
            setText(this.button, 'Недоступно');
            setDisabled(this.button, true);
        } else {
            setText(this.button, data.inBasket ? 'Удалить из корзины' : 'Купить');
            setDisabled(this.button, false);
        }

        return this.container;
    }
}

export class BasketCard extends Card<BasketCardData> {
    protected index: HTMLElement;
    protected deleteButton: HTMLButtonElement;
    protected id = '';

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.index = container.querySelector('.basket__item-index') as HTMLElement;
        this.deleteButton = container.querySelector('.basket__item-delete') as HTMLButtonElement;

        this.deleteButton.addEventListener('click', () => {
            this.events.emit<ProductEvent>(AppEvents.BasketRemove, { id: this.id });
        });
    }

    render(data: BasketCardData): HTMLElement {
        this.id = data.id;
        this.setTitle(data.title);
        this.setPrice(data.price);
        setText(this.index, data.index);
        return this.container;
    }
}
