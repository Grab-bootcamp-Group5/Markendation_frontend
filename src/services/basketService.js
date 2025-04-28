import axiosPrivate from './axiosPrivate';

export const basketService = {
    updateBasket: async (basketItems) => {
        const formattedBasketItems = {
            ingredients: [...(basketItems.ingredients || [])],
            dishes: []
        };

        if (basketItems.dishes) {
            if (Array.isArray(basketItems.dishes)) {
                formattedBasketItems.dishes = basketItems.dishes;
            } else {
                formattedBasketItems.dishes = Object.values(basketItems.dishes);
            }
        }

        formattedBasketItems.ingredients = formattedBasketItems.ingredients.map(item => ({
            id: item.id,
            vietnameseName: item.vietnameseName,
            name: item.name,
            unit: item.unit,
            imageUrl: item.imageUrl || item.image,
            category: item.category,
            quantity: parseFloat(item.quantity) || 1
        }));

        const response = await axiosPrivate.post('/basket/update', formattedBasketItems);
        return response.data;
    },

    calculateBasket: async () => {
        try {
            const response = await axiosPrivate.get('/basket/calculate');
            return response.data;
        } catch (error) {
            console.error("Error calculating basket:", error);
            throw error;
        }
    }
};