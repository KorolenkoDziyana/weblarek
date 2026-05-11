import { ErrorsBuyer, IBuyer } from '../../types';
import { IEvents } from '../base/Events';
import { AppEvents } from '../../utils/events';

const ERROR_MESSAGES: Record<keyof IBuyer, string> = {
    payment: 'Не выбран вид оплаты',
    email: 'Укажите email',
    phone: 'Укажите телефон',
    address: 'Укажите адрес',
};

export class BuyerModel {
    protected data: IBuyer;
    protected events?: IEvents;

    constructor(data: Partial<IBuyer> = {}, events?: IEvents) {
        this.data = {
            payment: null,
            email: '',
            phone: '',
            address: '',
            ...data,
        };
        this.events = events;
    }

    setData(data: Partial<IBuyer>): void {
        this.data = {
            ...this.data,
            ...data,
        };
        this.events?.emit(AppEvents.BuyerChanged);
    }

    getData(): IBuyer {
        return { ...this.data };
    }

    clear(): void {
        this.data = {
            payment: null,
            email: '',
            phone: '',
            address: '',
        };
        this.events?.emit(AppEvents.BuyerChanged);
    }

    validate(): ErrorsBuyer {
        const fields: Array<keyof IBuyer> = ['payment', 'email', 'phone', 'address'];
        const errors: ErrorsBuyer = {};

        fields.forEach((field) => {
            const error = this.validateField(field);

            if (error) {
                errors[field] = error;
            }
        });

        return errors;
    }

    validateField(field: keyof IBuyer): string | undefined {
        const value = this.data[field];

        if (typeof value === 'string') {
            return value.trim() ? undefined : ERROR_MESSAGES[field];
        }

        return value ? undefined : ERROR_MESSAGES[field];
    }
}
