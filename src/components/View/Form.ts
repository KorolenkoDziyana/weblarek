import { Component } from '../base/Component';
import { FormErrors, IBuyer, TPayment } from '../../types';
import { setDisabled, setText } from './helpers';

type FormViewData = {
    valid: boolean;
    errors: FormErrors;
};

export abstract class Form<T extends FormViewData> extends Component<T> {
    protected submitButton: HTMLButtonElement;
    protected errors: HTMLElement;

    protected constructor(container: HTMLFormElement) {
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

export class OrderForm extends Form<OrderFormData> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(
        container: HTMLFormElement,
        onInput: (field: keyof IBuyer, value: string | TPayment | null) => void,
        onSubmit: () => void
    ) {
        super(container);
        this.cardButton = container.elements.namedItem('card') as HTMLButtonElement;
        this.cashButton = container.elements.namedItem('cash') as HTMLButtonElement;
        this.addressInput = container.elements.namedItem('address') as HTMLInputElement;

        this.cardButton.addEventListener('click', () => {
            onInput('payment', this.cardButton.name as TPayment);
        });

        this.cashButton.addEventListener('click', () => {
            onInput('payment', this.cashButton.name as TPayment);
        });

        this.addressInput.addEventListener('input', () => {
            onInput('address', this.addressInput.value);
        });

        container.addEventListener('submit', (event) => {
            event.preventDefault();
            onSubmit();
        });
    }

    render(data: OrderFormData): HTMLElement {
        super.render(data);
        this.addressInput.value = data.address;
        this.cardButton.classList.toggle('button_alt-active', data.payment === this.cardButton.name);
        this.cashButton.classList.toggle('button_alt-active', data.payment === this.cashButton.name);
        this.setErrors([data.errors.payment ?? '', data.errors.address ?? '']);
        return this.container;
    }
}

type ContactsFormData = FormViewData & Pick<IBuyer, 'email' | 'phone'>;

export class ContactsForm extends Form<ContactsFormData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(
        container: HTMLFormElement,
        onInput: (field: keyof IBuyer, value: string | TPayment | null) => void,
        onSubmit: () => void
    ) {
        super(container);
        this.emailInput = container.elements.namedItem('email') as HTMLInputElement;
        this.phoneInput = container.elements.namedItem('phone') as HTMLInputElement;

        this.emailInput.addEventListener('input', () => {
            onInput('email', this.emailInput.value);
        });

        this.phoneInput.addEventListener('input', () => {
            onInput('phone', this.phoneInput.value);
        });

        container.addEventListener('submit', (event) => {
            event.preventDefault();
            onSubmit();
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
