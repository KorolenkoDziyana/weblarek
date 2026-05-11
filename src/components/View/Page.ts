import { IEvents } from '../base/Events';
import { AppEvents } from '../../utils/events';
import { setText } from './helpers';

export class Page {
    protected gallery: HTMLElement;
    protected basketButton: HTMLButtonElement;
    protected basketCounter: HTMLElement;
    protected wrapper: HTMLElement;

    constructor(protected container: HTMLElement, protected events: IEvents) {
        this.gallery = container.querySelector('.gallery') as HTMLElement;
        this.basketButton = container.querySelector('.header__basket') as HTMLButtonElement;
        this.basketCounter = container.querySelector('.header__basket-counter') as HTMLElement;
        this.wrapper = container.querySelector('.page__wrapper') as HTMLElement;

        this.basketButton.addEventListener('click', () => {
            this.events.emit(AppEvents.BasketOpen);
        });
    }

    set catalog(items: HTMLElement[]) {
        this.gallery.replaceChildren(...items);
    }

    set counter(value: number) {
        setText(this.basketCounter, value);
    }

    set locked(value: boolean) {
        this.wrapper.classList.toggle('page__wrapper_locked', value);
    }
}
