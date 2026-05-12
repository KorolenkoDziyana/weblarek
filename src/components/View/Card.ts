import { Component } from '../base/Component';
import { IProduct } from '../../types';
import { CDN_URL, categoryMap } from '../../utils/constants';
import { formatPrice, setCategoryClass, setDisabled, setText } from './helpers';

type CategoryName = keyof typeof categoryMap;

export type CatalogCardData = Pick<IProduct, 'title' | 'category' | 'image' | 'price'>;
export type PreviewCardData = Omit<IProduct, 'id'>;
export type BasketCardData = Pick<IProduct, 'title' | 'price'> & {
    index: number;
};

type CardActions = {
    onClick: () => void;
};

type BasketCardActions = {
    onDelete: () => void;
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

    constructor(container: HTMLElement, actions: CardActions) {
        super(container);
        this.image = container.querySelector('.card__image') as HTMLImageElement;
        this.category = container.querySelector('.card__category') as HTMLElement;

        this.container.addEventListener('click', actions.onClick);
    }

    render(data: CatalogCardData): HTMLElement {
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

    constructor(container: HTMLElement, actions: CardActions) {
        super(container);
        this.image = container.querySelector('.card__image') as HTMLImageElement;
        this.category = container.querySelector('.card__category') as HTMLElement;
        this.description = container.querySelector('.card__text') as HTMLElement;
        this.button = container.querySelector('.card__button') as HTMLButtonElement;

        this.button.addEventListener('click', actions.onClick);
    }

    render(data: PreviewCardData): HTMLElement {
        this.setTitle(data.title);
        this.setPrice(data.price);
        this.setImage(this.image, this.getImageUrl(data.image), data.title);
        setText(this.category, data.category);
        setText(this.description, data.description);
        setCategoryClass(this.category, categoryMap[data.category as CategoryName]);
        return this.container;
    }

    setButton(value: string): void {
        setText(this.button, value);
    }

    setButtonDisabled(value: boolean): void {
        setDisabled(this.button, value);
    }
}

export class BasketCard extends Card<BasketCardData> {
    protected index: HTMLElement;
    protected deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, actions: BasketCardActions) {
        super(container);
        this.index = container.querySelector('.basket__item-index') as HTMLElement;
        this.deleteButton = container.querySelector('.basket__item-delete') as HTMLButtonElement;

        this.deleteButton.addEventListener('click', actions.onDelete);
    }

    render(data: BasketCardData): HTMLElement {
        this.setTitle(data.title);
        this.setPrice(data.price);
        setText(this.index, data.index);
        return this.container;
    }
}
