import { IBuyer, IBuyerFormErrors } from '../../types';

const ERROR_MESSAGES: Record<keyof IBuyer, string> = {
    payment: 'Не выбран вид оплаты',
    email: 'Укажите email',
    phone: 'Укажите телефон',
    address: 'Укажите адрес',
};

export class BuyerModel {
    protected data: Partial<IBuyer>;
    protected errors: IBuyerFormErrors;

    constructor(data: Partial<IBuyer> = {}) {
        this.data = data;
        this.errors = {};
    }

    setData(data: Partial<IBuyer>): void {
        this.data = {
            ...this.data,
            ...data,
        };
    }

    getData(): Partial<IBuyer> {
        return this.data;
    }

    clear(): void {
        this.data = {};
        this.errors = {};
    }

    validate(): IBuyerFormErrors {
        const fields: Array<keyof IBuyer> = ['payment', 'email', 'phone', 'address'];
        const errors: IBuyerFormErrors = {};

        fields.forEach((field) => {
            const error = this.validateField(field);

            if (error) {
                errors[field] = error;
            }
        });

        this.errors = errors;

        return this.errors;
    }

    validateField(field: keyof IBuyer): string | undefined {
        const value = this.data[field];

        if (typeof value === 'string') {
            return value.trim() ? undefined : ERROR_MESSAGES[field];
        }

        return value ? undefined : ERROR_MESSAGES[field];
    }

    getErrors(): IBuyerFormErrors {
        return this.errors;
    }
}
