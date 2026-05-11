export const AppEvents = {
    CatalogChanged: 'catalog:changed',
    PreviewChanged: 'preview:changed',
    BasketChanged: 'basket:changed',
    BuyerChanged: 'buyer:changed',

    CardSelect: 'card:select',
    ProductToggle: 'product:toggle',
    BasketOpen: 'basket:open',
    BasketRemove: 'basket:remove',
    OrderOpen: 'order:open',
    OrderNext: 'order:next',
    OrderSubmit: 'order:submit',
    FormInput: 'form:input',
    ModalClose: 'modal:close',
} as const;
