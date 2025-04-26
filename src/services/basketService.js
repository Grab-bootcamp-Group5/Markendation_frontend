import axiosPrivate from './axiosPrivate';

export const basketService = {
    // Lấy thông tin giỏ hàng của người dùng
    getBasket: async () => {
        const response = await axiosPrivate.get('/basket');
        return response.data;
    },

    // Thêm ingredient vào giỏ hàng
    addIngredient: async (ingredientData) => {
        const response = await axiosPrivate.post('/basket/add/ingredient', ingredientData);
        return response.data;
    },

    // Thêm dish vào giỏ hàng 
    addDish: async (dishData) => {
        // Note: This endpoint wasn't specified in the documentation provided
        // When available, update this method
        const response = await axiosPrivate.post('/basket/add/dish', dishData);
        return response.data;
    },

    // Xóa ingredient khỏi giỏ hàng 
    deleteIngredient: async (ingredientId) => {
        // Note: This endpoint wasn't specified in the documentation provided
        // When available, update this method
        const response = await axiosPrivate.delete('/basket/delete/ingredient', {
            data: { ingredientId }
        });
        return response.data;
    },

    // Xóa dish khỏi giỏ hàng
    deleteDish: async (dishId) => {
        // Note: This endpoint wasn't specified in the documentation provided
        // When available, update this method
        const response = await axiosPrivate.delete('/basket/delete/dish', {
            data: { dishId }
        });
        return response.data;
    },

    // Tính toán giỏ hàng
    calculateBasket: async () => {
        // Note: This endpoint wasn't specified in the documentation provided
        // When available, update this method
        const response = await axiosPrivate.get('/basket/calculate');
        return response.data;
    }
};