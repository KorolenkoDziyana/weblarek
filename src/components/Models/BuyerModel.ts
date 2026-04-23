import { ErrorsBuyer, IBuyer } from '../../types';

const ERROR_MESSAGES: Record<keyof IBuyer, string> = {
    payment: 'Не выбран вид оплаты',
    email: 'Укажите email',
    phone: 'Укажите телефон',
    address: 'Укажите адрес',
};

export class BuyerModel {
    protected data: IBuyer;

    constructor(data: Partial<IBuyer> = {}) {
        this.data = {
            payment: 'online',
            email: '',
            phone: '',
            address: '',
            ...data,
        };
    }

    setData(data: Partial<IBuyer>): void {
        this.data = {
            ...this.data,
            ...data,
        };
    }

    getData(): IBuyer {
        return this.data;
    }

    clear(): void {
        this.data = {
            payment: 'online',
            email: '',
            phone: '',
            address: '',
        };
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
