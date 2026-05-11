import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { BuyerFieldEvent, FormErrors, IBuyer, TPayment, TPaymentButton } from '../../types';
import { AppEvents } from '../../utils/events';
import { setDisabled, setText } from './helpers';

type FormViewData = {
    valid: boolean;
    errors: FormErrors;
};

export abstract class Form<T extends FormViewData> extends Component<T> {
    protected submitButton: HTMLButtonElement;
    protected errors: HTMLElement;

    protected constructor(container: HTMLFormElement, protected events: IEvents) {
        super(container);
        this.submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
        this.errors = container.querySelector('.form__errors') as HTMLElement;
    }

    protected setValid(value: boolean): void {
        setDisabled(this.submitButton, !value);
    }

    protected setErrors(errors: string[]): void {
        setText(this.errors, errors.filter(Boolean).join('; '));
    }

    render(data: T): HTMLElement {
        this.setValid(data.valid);
        return this.container;
    }
}

type OrderFormData = FormViewData & Pick<IBuyer, 'payment' | 'address'>;

const paymentByButton: Record<TPaymentButton, TPayment> = {
    card: 'online',
    cash: 'cash',
};

const buttonByPayment: Record<TPayment, TPaymentButton> = {
    online: 'card',
    cash: 'cash',
};

export class OrderForm extends Form<OrderFormData> {
    protected paymentButtons: HTMLButtonElement[];
    protected addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this.paymentButtons = Array.from(container.querySelectorAll('.order__buttons .button')) as HTMLButtonElement[];
        this.addressInput = container.elements.namedItem('address') as HTMLInputElement;

        this.paymentButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const payment = paymentByButton[button.name as TPaymentButton];
                this.events.emit<BuyerFieldEvent>(AppEvents.FormInput, { field: 'payment', value: payment });
            });
        });

        this.addressInput.addEventListener('input', () => {
            this.events.emit<BuyerFieldEvent>(AppEvents.FormInput, { field: 'address', value: this.addressInput.value });
        });

        container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit(AppEvents.OrderNext);
        });
    }

    render(data: OrderFormData): HTMLElement {
        super.render(data);
        this.addressInput.value = data.address;
        this.paymentButtons.forEach((button) => {
            const isActive = data.payment !== null && button.name === buttonByPayment[data.payment];
            button.classList.toggle('button_alt-active', isActive);
        });
        this.setErrors([data.errors.payment ?? '', data.errors.address ?? '']);
        return this.container;
    }
}

type ContactsFormData = FormViewData & Pick<IBuyer, 'email' | 'phone'>;

export class ContactsForm extends Form<ContactsFormData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this.emailInput = container.elements.namedItem('email') as HTMLInputElement;
        this.phoneInput = container.elements.namedItem('phone') as HTMLInputElement;

        this.emailInput.addEventListener('input', () => {
            this.events.emit<BuyerFieldEvent>(AppEvents.FormInput, { field: 'email', value: this.emailInput.value });
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit<BuyerFieldEvent>(AppEvents.FormInput, { field: 'phone', value: this.phoneInput.value });
        });

        container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit(AppEvents.OrderSubmit);
        });
    }

    render(data: ContactsFormData): HTMLElement {
        super.render(data);
        this.emailInput.value = data.email;
        this.phoneInput.value = data.phone;
        this.setErrors([data.errors.email ?? '', data.errors.phone ?? '']);
        return this.container;
    }
}
