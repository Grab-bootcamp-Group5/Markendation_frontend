import axiosPrivate from './axiosPrivate';

const formatBasketData = (basketItems) => {
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

    return formattedBasketItems;
};

// Tạo một debounce function để giảm số lần gọi API
const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// Khởi tạo biến để lưu Promise cuối cùng
let lastUpdatePromise = Promise.resolve();

export const basketService = {
    // Cập nhật giỏ hàng
    updateBasket: async (basketItems) => {
        // Đảm bảo các thao tác cập nhật được xử lý theo thứ tự
        lastUpdatePromise = lastUpdatePromise.then(async () => {
            try {
                const formattedBasketItems = formatBasketData(basketItems);
                const response = await axiosPrivate.post('/basket/update', formattedBasketItems);
                return response.data;
            } catch (error) {
                console.error("Error updating basket:", error);
                throw error;
            }
        });

        return lastUpdatePromise;
    },

    // Tạo một phiên bản updateBasket bị debounce để sử dụng cho các thao tác thay đổi nhanh
    debouncedUpdateBasket: debounce(async (basketItems) => {
        try {
            const formattedBasketItems = formatBasketData(basketItems);
            const response = await axiosPrivate.post('/basket/update', formattedBasketItems);
            return response.data;
        } catch (error) {
            console.error("Error updating basket:", error);
            throw error;
        }
    }, 800), // 800ms delay

    // Tính toán giỏ hàng
    calculateBasket: async () => {
        try {
            const response = await axiosPrivate.get('/basket/calculate');
            return response.data;
        } catch (error) {
            console.error("Error calculating basket:", error);
            throw error;
        }
    },

    // Lưu giỏ hàng yêu thích
    saveFavoriteBasket: async () => {
        try {
            const response = await axiosPrivate.post('/basket/save-favorite');
            return response.data;
        } catch (error) {
            console.error("Error saving favorite basket:", error);
            throw error;
        }
    },

    // Lấy giỏ hàng từ server
    getBasket: async () => {
        try {
            const response = await axiosPrivate.get('/basket');
            return response.data;
        } catch (error) {
            console.error("Error fetching basket:", error);
            throw error;
        }
    }
};