import './scss/styles.scss';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { WebLarekApi } from './components/Communication/WebLarekApi';
import { BasketModel } from './components/Models/BasketModel';
import { BuyerModel } from './components/Models/BuyerModel';
import { ProductCatalogModel } from './components/Models/ProductCatalogModel';
import { Basket } from './components/View/Basket';
import { BasketCard, CatalogCard, PreviewCard } from './components/View/Card';
import { ContactsForm, OrderForm } from './components/View/Form';
import { Modal } from './components/View/Modal';
import { Page } from './components/View/Page';
import { Success } from './components/View/Success';
import { BuyerFieldEvent, IBuyer, IOrderRequest, IProduct } from './types';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';
import { AppEvents } from './utils/events';
import { cloneTemplate, ensureElement } from './utils/utils';

type ModalState = 'preview' | 'basket' | 'order' | 'contacts' | 'success' | null;

const PREVIEW_BUTTON_UNAVAILABLE = 'Недоступно';
const PREVIEW_BUTTON_REMOVE = 'Удалить из корзины';
const PREVIEW_BUTTON_BUY = 'Купить';

const events = new EventEmitter();
const api = new WebLarekApi(new Api(API_URL));

const catalogModel = new ProductCatalogModel([], null, events);
const basketModel = new BasketModel([], events);
const buyerModel = new BuyerModel({}, events);

const page = new Page(document.body, () => {
    events.emit(AppEvents.BasketOpen);
});
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), () => {
    events.emit(AppEvents.ModalClose);
});

const basketView = new Basket(cloneTemplate<HTMLElement>('#basket'), () => {
    events.emit(AppEvents.OrderOpen);
});
const orderForm = new OrderForm(
    cloneTemplate<HTMLFormElement>('#order'),
    (field, value) => {
        events.emit<BuyerFieldEvent>(AppEvents.FormInput, { field, value });
    },
    () => {
        events.emit(AppEvents.OrderNext);
    }
);
const contactsForm = new ContactsForm(
    cloneTemplate<HTMLFormElement>('#contacts'),
    (field, value) => {
        events.emit<BuyerFieldEvent>(AppEvents.FormInput, { field, value });
    },
    () => {
        events.emit(AppEvents.OrderSubmit);
    }
);
const successView = new Success(cloneTemplate<HTMLElement>('#success'), () => {
    events.emit(AppEvents.ModalClose);
});

let modalState: ModalState = null;

function getOrderErrors(data: IBuyer) {
    const errors = buyerModel.validate();
    return {
        payment: data.payment ? undefined : errors.payment,
        address: data.address.trim() ? undefined : errors.address,
    };
}

function getContactsErrors(data: IBuyer) {
    const errors = buyerModel.validate();
    return {
        email: data.email.trim() ? undefined : errors.email,
        phone: data.phone.trim() ? undefined : errors.phone,
    };
}

function hasErrors(errors: Record<string, string | undefined>): boolean {
    return Object.values(errors).some(Boolean);
}

function renderCatalog(): void {
    page.catalog = catalogModel.getItems().map((item) => {
        return new CatalogCard(cloneTemplate<HTMLElement>('#card-catalog'), {
            onClick: () => {
                events.emit<IProduct>(AppEvents.CardSelect, item);
            },
        }).render(item);
    });
}

function renderBasket(): HTMLElement {
    const items = basketModel.getItems().map((item, index) => {
        return new BasketCard(cloneTemplate<HTMLElement>('#card-basket'), {
            onDelete: () => {
                events.emit<IProduct>(AppEvents.BasketRemove, item);
            },
        }).render({
            title: item.title,
            price: item.price,
            index: index + 1,
        });
    });

    return basketView.render({
        items,
        total: basketModel.getTotal(),
        buttonDisabled: basketModel.getCount() === 0,
    });
}

function createPreviewCard(): PreviewCard {
    return new PreviewCard(cloneTemplate<HTMLElement>('#card-preview'), {
        onClick: () => {
            events.emit(AppEvents.ProductToggle);
            closeModal();
        },
    });
}

function renderOrderForm(): HTMLElement {
    const data = buyerModel.getData();
    const errors = getOrderErrors(data);

    return orderForm.render({
        payment: data.payment,
        address: data.address,
        errors,
        valid: Boolean(data.payment) && data.address.trim().length > 0 && !hasErrors(errors),
    });
}

function renderContactsForm(): HTMLElement {
    const data = buyerModel.getData();
    const errors = getContactsErrors(data);

    return contactsForm.render({
        email: data.email,
        phone: data.phone,
        errors,
        valid: data.email.trim().length > 0 && data.phone.trim().length > 0 && !hasErrors(errors),
    });
}

function openModal(content: HTMLElement, state: ModalState): void {
    modalState = state;
    modal.render(content);
    modal.open();
    page.locked = true;
}

function closeModal(): void {
    modalState = null;
    modal.close();
    page.locked = false;
}

events.on(AppEvents.CatalogChanged, () => {
    renderCatalog();
});

events.on(AppEvents.PreviewChanged, () => {
    const item = catalogModel.getPreview();

    if (item) {
        const previewCard = createPreviewCard();
        const isUnavailable = item.price === null;
        const isInBasket = basketModel.hasItem(item.id);
        const buttonText = isUnavailable
            ? PREVIEW_BUTTON_UNAVAILABLE
            : isInBasket
                ? PREVIEW_BUTTON_REMOVE
                : PREVIEW_BUTTON_BUY;

        const previewContent = previewCard.render(item);

        previewCard.setButton(buttonText);
        previewCard.setButtonDisabled(isUnavailable);
        openModal(previewContent, 'preview');
    }
});

events.on(AppEvents.BasketChanged, () => {
    page.counter = basketModel.getCount();

    if (modalState === 'basket') {
        modal.render(renderBasket());
    }
});

events.on(AppEvents.BuyerChanged, () => {
    if (modalState === 'order') {
        modal.render(renderOrderForm());
    }

    if (modalState === 'contacts') {
        modal.render(renderContactsForm());
    }
});

events.on<IProduct>(AppEvents.CardSelect, (item) => {
    catalogModel.setPreview(item);
});

events.on(AppEvents.ProductToggle, () => {
    const item = catalogModel.getPreview();

    if (!item) {
        return;
    }

    if (basketModel.hasItem(item.id)) {
        basketModel.removeItem(item);
    } else if (item.price !== null) {
        basketModel.addItem(item);
    }
});

events.on(AppEvents.BasketOpen, () => {
    openModal(renderBasket(), 'basket');
});

events.on<IProduct>(AppEvents.BasketRemove, (item) => {
    basketModel.removeItem(item);
});

events.on(AppEvents.OrderOpen, () => {
    openModal(renderOrderForm(), 'order');
});

events.on<BuyerFieldEvent>(AppEvents.FormInput, ({ field, value }) => {
    buyerModel.setData({ [field]: value } as Partial<IBuyer>);
});

events.on(AppEvents.OrderNext, () => {
    openModal(renderContactsForm(), 'contacts');
});

events.on(AppEvents.OrderSubmit, () => {
    const buyer = buyerModel.getData();
    const order: IOrderRequest = {
        ...buyer,
        items: basketModel.getItems().map((item) => item.id),
        total: basketModel.getTotal(),
    };

    api.createOrder(order)
        .then((response) => {
            basketModel.clear();
            buyerModel.clear();
            openModal(successView.render({ total: response.total }), 'success');
        })
        .catch((error: unknown) => {
            console.error('Ошибка оформления заказа:', error);
        });
});

events.on(AppEvents.ModalClose, () => {
    closeModal();
});

api.getProducts()
    .then((response) => {
        catalogModel.setItems(response.items);
    })
    .catch((error: unknown) => {
        console.error('Ошибка загрузки каталога:', error);
        catalogModel.setItems(apiProducts.items);
    });
