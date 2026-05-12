# Проектная работа "Веб-ларёк"

Интернет-магазин товаров для разработчиков. Приложение загружает каталог товаров, показывает подробную карточку товара, управляет корзиной и оформляет заказ через две формы.

Стек: HTML, SCSS, TypeScript, Vite.

## Запуск

```bash
npm install
npm run dev
```

Сборка проекта:

```bash
npm run build
```

Переменная окружения:

```env
VITE_API_ORIGIN=https://larek-api.nomoreparties.co
```

## Структура проекта

- `src/main.ts` - точка входа и презентер приложения.
- `src/types/index.ts` - единый файл типов приложения.
- `src/components/base/` - базовый код: API, брокер событий, базовый компонент.
- `src/components/Communication/` - коммуникационный слой для работы с сервером.
- `src/components/Models/` - модели данных каталога, корзины и покупателя.
- `src/components/View/` - компоненты представления.
- `src/utils/` - константы, события и вспомогательные функции.
- `src/pages/index.html` - HTML-шаблоны компонентов.
- `src/common.blocks/` и `src/scss/` - стили проекта.

## Архитектура MVP

Проект построен по паттерну MVP.

Model хранит данные приложения и сообщает об их изменении событиями. Модели не работают с DOM и не выполняют запросы к серверу.

View отвечает за DOM: находит элементы в своём контейнере, сохраняет их в полях, отображает переданные данные и навешивает переданные из презентера обработчики пользовательских действий. Полями View-классов являются только HTML-элементы.

Presenter реализован в `src/main.ts`. Он подписывается на события моделей, вызывает методы моделей, подготавливает данные для View, создаёт обработчики действий пользователя и обращается к API.

Взаимодействие слоёв построено через брокер событий `EventEmitter`.

## Типы данных

Все типы находятся в `src/types/index.ts`.

`ApiPostMethods = 'POST' | 'PUT' | 'DELETE'` - HTTP-методы для отправки данных.

`TPayment = 'card' | 'cash'` - способы оплаты в данных заказа. Значение берётся из атрибута `name` кнопки оплаты.

`IApi` - интерфейс базового API-клиента:

- `get<T extends object>(uri: string): Promise<T>` - выполняет GET-запрос.
- `post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>` - отправляет данные на сервер.

`IProduct` - товар:

- `id: string` - идентификатор товара.
- `description: string` - описание.
- `image: string` - путь к изображению.
- `title: string` - название.
- `category: string` - категория.
- `price: number | null` - цена или `null`, если товар недоступен для покупки.

`IBuyer` - данные покупателя:

- `payment: TPayment | null` - способ оплаты.
- `email: string` - почта.
- `phone: string` - телефон.
- `address: string` - адрес доставки.

`ErrorsBuyer = Partial<Record<keyof IBuyer, string>>` - ошибки валидации полей покупателя.

`IProductsResponse` - ответ сервера со списком товаров:

- `total: number` - количество товаров.
- `items: IProduct[]` - массив товаров.

`IOrderRequest extends IBuyer` - данные заказа:

- `items: IProduct['id'][]` - идентификаторы товаров.
- `total: number` - итоговая стоимость.

`IOrderResponse` - ответ сервера после оформления:

- `id: string` - идентификатор заказа.
- `total: number` - подтверждённая сумма.

`BuyerFieldEvent` - событие изменения поля покупателя:

- `field: keyof IBuyer`;
- `value: string | TPayment | null`.

`FormErrors = Partial<Record<keyof IBuyer, string>>` - ошибки для форм.

## Базовые классы

### Api

Файл: `src/components/base/Api.ts`.

Назначение: базовый HTTP-клиент.

Конструктор:

- `constructor(baseUrl: string, options: RequestInit = {})` - принимает базовый URL и настройки запроса.

Поля:

- `baseUrl: string` - базовый адрес API.
- `options: RequestInit` - общие настройки запросов.

Методы:

- `get<T extends object>(uri: string): Promise<T>` - выполняет GET-запрос.
- `post<T extends object>(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<T>` - выполняет POST, PUT или DELETE.
- `handleResponse<T>(response: Response): Promise<T>` - обрабатывает ответ сервера.

### EventEmitter

Файл: `src/components/base/Events.ts`.

Назначение: брокер событий для связи частей приложения.

Конструктор:

- `constructor()` - создаёт коллекцию подписчиков.

Поля:

- `_events: Map<EventName, Set<Subscriber>>` - подписчики на события.

Методы:

- `on<T extends object>(event: EventName, callback: (data: T) => void): void` - подписывает на событие.
- `off(eventName: EventName, callback: Subscriber): void` - снимает подписку.
- `emit<T extends object>(eventName: string, data?: T): void` - генерирует событие.
- `onAll(callback: (event: EmitterEvent) => void): void` - подписывает на все события.
- `offAll(): void` - очищает подписки.
- `trigger<T extends object>(eventName: string, context?: Partial<T>): (data: T) => void` - создаёт обработчик, который генерирует событие.

### Component

Файл: `src/components/base/Component.ts`.

Назначение: базовый класс DOM-компонента.

Конструктор:

- `protected constructor(container: HTMLElement)` - принимает корневой DOM-элемент компонента.

Поля:

- `container: HTMLElement` - корневой элемент.

Методы:

- `render(data?: Partial<T>): HTMLElement` - применяет данные и возвращает корневой элемент.
- `setImage(element: HTMLImageElement, src: string, alt?: string): void` - устанавливает изображение.

## Коммуникационный слой

### WebLarekApi

Файл: `src/components/Communication/WebLarekApi.ts`.

Назначение: работа с API Web-ларька. Класс использует базовый `Api` через композицию.

Конструктор:

- `constructor(api: IApi)` - принимает объект, реализующий интерфейс `IApi`.

Поля:

- `api: IApi` - API-клиент.

Методы:

- `getProducts(): Promise<IProductsResponse>` - получает каталог товаров.
- `createOrder(order: IOrderRequest): Promise<IOrderResponse>` - отправляет заказ.

## Модели данных

### ProductCatalogModel

Файл: `src/components/Models/ProductCatalogModel.ts`.

Назначение: хранит каталог товаров и товар для подробного просмотра.

Конструктор:

- `constructor(items: IProduct[] = [], preview: IProduct | null = null, events?: IEvents)` - принимает начальный каталог, выбранный товар и брокер событий.

Поля:

- `items: IProduct[]` - товары каталога.
- `preview: IProduct | null` - выбранный товар.
- `events?: IEvents` - брокер событий.

Методы:

- `setItems(items: IProduct[]): void` - сохраняет каталог и генерирует `catalog:changed`.
- `getItems(): IProduct[]` - возвращает каталог.
- `getItem(id: string): IProduct | undefined` - ищет товар по `id`.
- `setPreview(item: IProduct): void` - сохраняет выбранный товар и генерирует `preview:changed`.
- `getPreview(): IProduct | null` - возвращает выбранный товар.

### BasketModel

Файл: `src/components/Models/BasketModel.ts`.

Назначение: хранит товары корзины.

Конструктор:

- `constructor(items: IProduct[] = [], events?: IEvents)` - принимает начальные товары и брокер событий.

Поля:

- `items: IProduct[]` - товары корзины.
- `events?: IEvents` - брокер событий.

Методы:

- `getItems(): IProduct[]` - возвращает товары корзины.
- `addItem(item: IProduct): void` - добавляет товар и генерирует `basket:changed`.
- `removeItem(item: IProduct): void` - удаляет товар и генерирует `basket:changed`.
- `clear(): void` - очищает корзину и генерирует `basket:changed`.
- `getTotal(): number` - считает итоговую стоимость.
- `getCount(): number` - возвращает количество товаров.
- `hasItem(id: string): boolean` - проверяет наличие товара.

### BuyerModel

Файл: `src/components/Models/BuyerModel.ts`.

Назначение: хранит данные покупателя и валидирует их.

Конструктор:

- `constructor(data: Partial<IBuyer> = {}, events?: IEvents)` - принимает начальные данные и брокер событий.

Поля:

- `data: IBuyer` - данные покупателя.
- `events?: IEvents` - брокер событий.

Методы:

- `setData(data: Partial<IBuyer>): void` - обновляет часть данных и генерирует `buyer:changed`.
- `getData(): IBuyer` - возвращает копию данных покупателя.
- `clear(): void` - очищает данные и генерирует `buyer:changed`.
- `validate(): ErrorsBuyer` - возвращает ошибки всех полей.
- `validateField(field: keyof IBuyer): string | undefined` - валидирует одно поле.

## Компоненты представления

### Page

Файл: `src/components/View/Page.ts`.

Назначение: главная страница.

Конструктор:

- `constructor(container: HTMLElement, onBasketClick: () => void)` - принимает корневой элемент страницы и обработчик клика по корзине.

Поля:

- `gallery: HTMLElement` - контейнер каталога.
- `basketButton: HTMLButtonElement` - кнопка корзины.
- `basketCounter: HTMLElement` - счётчик корзины.
- `wrapper: HTMLElement` - обёртка страницы.

Сеттеры:

- `catalog: HTMLElement[]` - заменяет карточки каталога.
- `counter: number` - обновляет счётчик.
- `locked: boolean` - переключает состояние блокировки страницы.

### Modal

Файл: `src/components/View/Modal.ts`.

Назначение: универсальное модальное окно.

Конструктор:

- `constructor(container: HTMLElement, onClose: () => void)`.

Поля:

- `closeButton: HTMLButtonElement` - кнопка закрытия.
- `content: HTMLElement` - контейнер содержимого.

Методы:

- `render(content: HTMLElement): HTMLElement` - вставляет содержимое.
- `open(): void` - открывает окно.
- `close(): void` - закрывает окно и очищает содержимое.

### Card, CatalogCard, PreviewCard, BasketCard

Файл: `src/components/View/Card.ts`.

`Card<T>` - базовый абстрактный класс карточки.

Поля:

- `title: HTMLElement` - название.
- `price: HTMLElement` - цена.

Методы:

- `setTitle(value: string): void` - устанавливает название.
- `setPrice(value: number | null): void` - устанавливает цену.
- `getImageUrl(image: string): string` - формирует URL изображения.

`CatalogCard` - карточка каталога.

Поля:

- `image: HTMLImageElement`;
- `category: HTMLElement`.

Конструктор:

- `constructor(container: HTMLElement, actions: { onClick: () => void })`.

Метод:

- `render(data: CatalogCardData): HTMLElement`.

`PreviewCard` - подробная карточка товара.

Поля:

- `image: HTMLImageElement`;
- `category: HTMLElement`;
- `description: HTMLElement`;
- `button: HTMLButtonElement`.

Конструктор:

- `constructor(container: HTMLElement, actions: { onClick: () => void })`.

Метод:

- `render(data: PreviewCardData): HTMLElement`.
- `setButton(value: string): void` - устанавливает текст кнопки.
- `setButtonDisabled(value: boolean): void` - блокирует или разблокирует кнопку.

`BasketCard` - карточка товара в корзине.

Поля:

- `index: HTMLElement`;
- `deleteButton: HTMLButtonElement`.

Конструктор:

- `constructor(container: HTMLElement, actions: { onDelete: () => void })`.

Метод:

- `render(data: BasketCardData): HTMLElement`.

### Basket

Файл: `src/components/View/Basket.ts`.

Назначение: отображение корзины.

Конструктор:

- `constructor(container: HTMLElement, onSubmit: () => void)`.

Поля:

- `list: HTMLElement` - список товаров.
- `button: HTMLButtonElement` - кнопка оформления.
- `price: HTMLElement` - итоговая цена.

Метод:

- `render(data: { items: HTMLElement[]; total: number; buttonDisabled: boolean }): HTMLElement`.

### Form, OrderForm, ContactsForm

Файл: `src/components/View/Form.ts`.

`Form<T>` - базовый абстрактный класс формы.

Поля:

- `submitButton: HTMLButtonElement` - кнопка отправки.
- `errors: HTMLElement` - блок ошибок.

Методы:

- `setValid(value: boolean): void` - переключает активность кнопки.
- `setErrors(errors: string[]): void` - выводит ошибки.
- `render(data: T): HTMLElement` - отображает состояние формы.

`OrderForm` - первый шаг оформления.

Поля:

- `cardButton: HTMLButtonElement`;
- `cashButton: HTMLButtonElement`;
- `addressInput: HTMLInputElement`.

Конструктор:

- `constructor(container: HTMLFormElement, onInput: (field: keyof IBuyer, value: string | TPayment | null) => void, onSubmit: () => void)`.

Метод:

- `render(data: OrderFormData): HTMLElement`.

`ContactsForm` - второй шаг оформления.

Поля:

- `emailInput: HTMLInputElement`;
- `phoneInput: HTMLInputElement`.

Конструктор:

- `constructor(container: HTMLFormElement, onInput: (field: keyof IBuyer, value: string | TPayment | null) => void, onSubmit: () => void)`.

Метод:

- `render(data: ContactsFormData): HTMLElement`.

### Success

Файл: `src/components/View/Success.ts`.

Назначение: экран успешного заказа.

Конструктор:

- `constructor(container: HTMLElement, onClose: () => void)`.

Поля:

- `description: HTMLElement` - текст списанной суммы.
- `closeButton: HTMLButtonElement` - кнопка закрытия.

Метод:

- `render(data: { total: number }): HTMLElement`.

## События приложения

События моделей:

- `catalog:changed` - изменился каталог.
- `preview:changed` - изменился выбранный товар.
- `basket:changed` - изменилась корзина.
- `buyer:changed` - изменились данные покупателя.

События View:

- `card:select` - выбрана карточка товара.
- `product:toggle` - нажата кнопка покупки или удаления в подробной карточке.
- `basket:open` - открыта корзина.
- `basket:remove` - удаление товара из корзины.
- `order:open` - открытие формы заказа.
- `order:next` - переход ко второй форме.
- `order:submit` - отправка заказа.
- `form:input` - изменение поля формы.
- `modal:close` - закрытие модального окна.

## Основные сценарии

При загрузке приложения презентер получает товары через `WebLarekApi`, сохраняет их в `ProductCatalogModel`, а событие `catalog:changed` приводит к отображению каталога.

Клик по карточке вызывает обработчик, созданный в презентере внутри `map`. В этом обработчике генерируется `card:select` с товаром из параметра `item`; презентер сохраняет выбранный товар в модели, после `preview:changed` открывается модальное окно с подробной карточкой.

Кнопка в подробной карточке добавляет товар в корзину или удаляет его. После изменения корзины обновляется счётчик в шапке.

Корзина отображает список товаров, цены, общую стоимость и кнопку оформления. При пустой корзине кнопка оформления отключена.

Оформление состоит из двух шагов. Первый шаг проверяет оплату и адрес, второй - email и телефон. После отправки заказа презентер вызывает `createOrder`, очищает корзину и данные покупателя, затем показывает экран успеха.
