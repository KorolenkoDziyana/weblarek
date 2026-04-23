import './scss/styles.scss';
import { Api } from './components/base/Api';
import { WebLarekApi } from './components/Communication/WebLarekApi';
import { BasketModel } from './components/Models/BasketModel';
import { BuyerModel } from './components/Models/BuyerModel';
import { ProductCatalogModel } from './components/Models/ProductCatalogModel';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';

const catalogModel = new ProductCatalogModel();
const basketModel = new BasketModel();
const buyerModel = new BuyerModel();

const [firstProduct, secondProduct, thirdProduct] = apiProducts.items;

catalogModel.setItems(apiProducts.items);
console.log('Массив товаров из каталога:', catalogModel.getItems());
console.log('Товар по id из каталога:', catalogModel.getItem(firstProduct.id));
catalogModel.setPreview(secondProduct);
console.log('Товар для подробного просмотра:', catalogModel.getPreview());

basketModel.addItem(firstProduct);
basketModel.addItem(secondProduct);
basketModel.addItem(thirdProduct);
console.log('Товары в корзине после добавления:', basketModel.getItems());
console.log('Количество товаров в корзине:', basketModel.getCount());
console.log('Общая стоимость товаров в корзине:', basketModel.getTotal());
console.log('Проверка наличия товара в корзине:', basketModel.hasItem(secondProduct.id));
basketModel.removeItem(secondProduct);
console.log('Товары в корзине после удаления:', basketModel.getItems());
basketModel.clear();
console.log('Корзина после очистки:', basketModel.getItems());

console.log('Пустые данные покупателя:', buyerModel.getData());
console.log('Ошибки валидации пустой формы:', buyerModel.validate());
console.log('Ошибка поля email:', buyerModel.validateField('email'));
buyerModel.setData({
    payment: 'online',
    address: 'г. Минск, ул. Пушкина, д. 10',
});
console.log('Данные покупателя после частичного заполнения:', buyerModel.getData());
buyerModel.setData({
    email: 'user@example.com',
    phone: '+375291234567',
});
console.log('Данные покупателя после полного заполнения:', buyerModel.getData());
console.log('Ошибки валидации заполненной формы:', buyerModel.validate());
buyerModel.clear();
console.log('Данные покупателя после очистки:', buyerModel.getData());
console.log('Ошибки покупателя после очистки:', buyerModel.validate());

const baseApi = new Api(API_URL);
const webLarekApi = new WebLarekApi(baseApi);

webLarekApi
    .getProducts()
    .then((response) => {
        catalogModel.setItems(response.items);
        console.log('Каталог товаров, полученный с сервера:', catalogModel.getItems());
    })
    .catch((error: unknown) => {
        console.error('Ошибка при получении каталога с сервера:', error);
    });
