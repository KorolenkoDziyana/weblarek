import { Component } from '../base/Component';
import { formatPrice, setDisabled, setText } from './helpers';

type BasketViewData = {
    items: HTMLElement[];
    total: number;
    buttonDisabled: boolean;
};

export class Basket extends Component<BasketViewData> {
    protected list: HTMLElement;
    protected button: HTMLButtonElement;
    protected price: HTMLElement;

    constructor(container: HTMLElement, onSubmit: () => void) {
        super(container);
        this.list = container.querySelector('.basket__list') as HTMLElement;
        this.button = container.querySelector('.basket__button') as HTMLButtonElement;
        this.price = container.querySelector('.basket__price') as HTMLElement;

        this.button.addEventListener('click', onSubmit);
    }

    render(data: BasketViewData): HTMLElement {
        this.list.replaceChildren(...data.items);
        setText(this.price, formatPrice(data.total));
        setDisabled(this.button, data.buttonDisabled);
        return this.container;
    }
}
