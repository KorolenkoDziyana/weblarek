import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { AppEvents } from '../../utils/events';
import { formatPrice, setDisabled, setText } from './helpers';

type BasketViewData = {
    items: HTMLElement[];
    total: number;
};

export class Basket extends Component<BasketViewData> {
    protected list: HTMLElement;
    protected button: HTMLButtonElement;
    protected price: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.list = container.querySelector('.basket__list') as HTMLElement;
        this.button = container.querySelector('.basket__button') as HTMLButtonElement;
        this.price = container.querySelector('.basket__price') as HTMLElement;

        this.button.addEventListener('click', () => {
            this.events.emit(AppEvents.OrderOpen);
        });
    }

    render(data: BasketViewData): HTMLElement {
        this.list.replaceChildren(...data.items);
        setText(this.price, formatPrice(data.total));
        setDisabled(this.button, data.items.length === 0);
        return this.container;
    }
}
