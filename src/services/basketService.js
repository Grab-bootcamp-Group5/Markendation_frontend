import axiosPrivate from './axiosPrivate';

export const basketService = {
    updateBasket: async (basketItems) => {
        const formattedBasketItems = {
            ...basketItems,
            dishes: Object.keys(basketItems.dishes || {}).length > 0
                ? basketItems.dishes
                : []
        };

        const response = await axiosPrivate.post('/basket/update', formattedBasketItems);
        return response.data;
    }
};