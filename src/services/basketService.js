import axiosPrivate from './axiosPrivate';

export const basketService = {
    // Lấy thông tin giỏ hàng của người dùng
    getBasket: () => {
        return axiosPrivate.get('/basket');
    },

    // Thêm ingredient vào giỏ hàng
    addIngredient: (ingredientData) => {
        return axiosPrivate.post('/basket/add/ingredient', ingredientData);
    },

    // Thêm dish vào giỏ hàng
    addDish: (dishData) => {
        return axiosPrivate.post('/basket/add/dish', dishData);
    },

    // Xóa ingredient khỏi giỏ hàng
    deleteIngredient: (ingredientId) => {
        return axiosPrivate.delete('/basket/delete/ingredient', {
            data: { ingredientId }
        });
    },

    // Xóa dish khỏi giỏ hàng
    deleteDish: (dishId) => {
        return axiosPrivate.delete('/basket/delete/dish', {
            data: { dishId }
        });
    },

    // Tính toán giỏ hàng
    calculateBasket: () => {
        return axiosPrivate.get('/basket/calculate');
    }
};
