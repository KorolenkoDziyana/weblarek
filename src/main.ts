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
import { BuyerFieldEvent, IBuyer, IOrderRequest, IProduct, ProductActionEvent, ProductEvent } from './types';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';
import { AppEvents } from './utils/events';
import { cloneTemplate, ensureElement } from './utils/utils';

type ModalState = 'preview' | 'basket' | 'order' | 'contacts' | 'success' | null;

const events = new EventEmitter();
const api = new WebLarekApi(new Api(API_URL));

const catalogModel = new ProductCatalogModel([], null, events);
const basketModel = new BasketModel([], events);
const buyerModel = new BuyerModel({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basketView = new Basket(cloneTemplate<HTMLElement>('#basket'), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>('#order'), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>('#contacts'), events);
const successView = new Success(cloneTemplate<HTMLElement>('#success'), events);

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
        return new CatalogCard(cloneTemplate<HTMLElement>('#card-catalog'), events).render(item);
    });
}

function renderBasket(): HTMLElement {
    const items = basketModel.getItems().map((item, index) => {
        return new BasketCard(cloneTemplate<HTMLElement>('#card-basket'), events).render({
            id: item.id,
            title: item.title,
            price: item.price,
            index: index + 1,
        });
    });

    return basketView.render({
        items,
        total: basketModel.getTotal(),
    });
}

function renderPreview(item: IProduct): HTMLElement {
    return new PreviewCard(cloneTemplate<HTMLElement>('#card-preview'), events).render({
        ...item,
        inBasket: basketModel.hasItem(item.id),
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
        openModal(renderPreview(item), 'preview');
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

events.on<ProductEvent>(AppEvents.CardSelect, ({ id }) => {
    const item = catalogModel.getItem(id);

    if (item) {
        catalogModel.setPreview(item);
    }
});

events.on<ProductActionEvent>(AppEvents.ProductToggle, ({ item }) => {
    if (basketModel.hasItem(item.id)) {
        basketModel.removeItem(item);
    } else if (item.price !== null) {
        basketModel.addItem(item);
    }

    closeModal();
});

events.on(AppEvents.BasketOpen, () => {
    openModal(renderBasket(), 'basket');
});

events.on<ProductEvent>(AppEvents.BasketRemove, ({ id }) => {
    const item = basketModel.getItems().find((basketItem) => basketItem.id === id);

    if (item) {
        basketModel.removeItem(item);
    }
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
