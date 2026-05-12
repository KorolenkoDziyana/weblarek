import { Component } from '../base/Component';
import { formatPrice, setText } from './helpers';

type SuccessData = {
    total: number;
};

export class Success extends Component<SuccessData> {
    protected description: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, onClose: () => void) {
        super(container);
        this.description = container.querySelector('.order-success__description') as HTMLElement;
        this.closeButton = container.querySelector('.order-success__close') as HTMLButtonElement;

        this.closeButton.addEventListener('click', onClose);
    }

    render(data: SuccessData): HTMLElement {
        setText(this.description, `Списано ${formatPrice(data.total)}`);
        return this.container;
    }
}
