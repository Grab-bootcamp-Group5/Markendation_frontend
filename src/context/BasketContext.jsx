import React, { createContext, useContext, useState, useEffect } from 'react';
import { basketService } from '../services/basketService';

const BasketContext = createContext();

export const useBasket = () => useContext(BasketContext);

export const BasketProvider = ({ children }) => {
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedBasket = localStorage.getItem('basketItems');
        if (storedBasket) {
            try {
                const parsedBasket = JSON.parse(storedBasket);

                // Đảm bảo cấu trúc dữ liệu đúng
                const processedBasket = {
                    ingredients: (parsedBasket.ingredients || []).map(item => ({
                        ...item,
                        // Đảm bảo quantity là số nguyên và tối thiểu là 1
                        quantity: parseInt(item.quantity, 10) || 1
                    })),
                    dishes: { ...(parsedBasket.dishes || {}) }
                };

                // Xử lý số lượng trong dishes
                Object.keys(processedBasket.dishes).forEach(dishId => {
                    const dish = processedBasket.dishes[dishId];

                    // Đảm bảo servings là số nguyên
                    dish.servings = parseInt(dish.servings, 10) || 1;

                    // Đảm bảo quantity trong ingredients là số nguyên
                    if (dish.ingredients) {
                        dish.ingredients = dish.ingredients.map(ingredient => ({
                            ...ingredient,
                            quantity: parseInt(ingredient.quantity, 10) || 1
                        }));
                    }
                });

                setBasketItems(processedBasket);
            } catch (error) {
                console.error("Error parsing basket from localStorage:", error);
                setBasketItems({
                    ingredients: [],
                    dishes: {}
                });
            }
        }
    }, []);

    // Lưu giỏ hàng vào localStorage khi có thay đổi
    useEffect(() => {
        if (basketItems.ingredients.length > 0 || Object.keys(basketItems.dishes).length > 0) {
            localStorage.setItem('basketItems', JSON.stringify(basketItems));
        }
    }, [basketItems]);

    // Thêm nguyên liệu vào giỏ hàng
    const addIngredient = async (ingredientData) => {
        try {
            setLoading(true);

            // Đảm bảo quantity là số nguyên và tối thiểu là 1
            const processedIngredientData = {
                ...ingredientData,
                quantity: Math.max(1, parseInt(ingredientData.quantity, 10) || 1)
            };

            // Kiểm tra xem nguyên liệu đã tồn tại trong giỏ hàng chưa
            const existingIndex = basketItems.ingredients.findIndex(
                item => item.id === processedIngredientData.id
            );

            let updatedBasketItems;

            if (existingIndex >= 0) {
                // Nếu đã tồn tại, cập nhật số lượng
                const updatedIngredients = [...basketItems.ingredients];
                const existingQuantity = parseInt(updatedIngredients[existingIndex].quantity, 10) || 0;
                updatedIngredients[existingIndex] = {
                    ...processedIngredientData,
                    quantity: existingQuantity + processedIngredientData.quantity
                };

                updatedBasketItems = {
                    ...basketItems,
                    ingredients: updatedIngredients
                };
            } else {
                // Nếu chưa tồn tại, thêm mới
                updatedBasketItems = {
                    ...basketItems,
                    ingredients: [...basketItems.ingredients, processedIngredientData]
                };
            }

            // Cập nhật state giỏ hàng
            setBasketItems(updatedBasketItems);

            // Đồng bộ với server
            try {
                await basketService.updateBasket(updatedBasketItems);
                setLoading(false);
                return processedIngredientData; // Trả về dữ liệu nếu thành công
            } catch (error) {
                console.error("Error syncing with server:", error);
                setLoading(false);
                return {}; // Trả về object rỗng nếu có lỗi
            }
        } catch (error) {
            console.error("Error adding ingredient to basket:", error);
            setLoading(false);
            return {}; // Trả về object rỗng nếu có lỗi
        }
    };

    // Thêm món ăn vào giỏ hàng
    const addDish = async (dishData) => {
        try {
            setLoading(true);

            // Đảm bảo servings là số nguyên và tối thiểu là 1
            const processedDishData = {
                ...dishData,
                servings: Math.max(1, parseInt(dishData.servings, 10) || 1),
                ingredients: dishData.ingredients ? dishData.ingredients.map(ingredient => ({
                    ...ingredient,
                    quantity: Math.max(1, parseInt(ingredient.quantity, 10) || 1)
                })) : []
            };

            // Kiểm tra xem món ăn đã tồn tại trong giỏ hàng chưa
            const dishExists = basketItems.dishes[processedDishData.id];

            let updatedBasketItems;

            if (dishExists) {
                // Nếu đã tồn tại, cập nhật số lượng phần ăn
                updatedBasketItems = {
                    ...basketItems,
                    dishes: {
                        ...basketItems.dishes,
                        [processedDishData.id]: {
                            ...processedDishData,
                            servings: (parseInt(dishExists.servings, 10) || 1) + processedDishData.servings
                        }
                    }
                };
            } else {
                // Nếu chưa tồn tại, thêm mới
                updatedBasketItems = {
                    ...basketItems,
                    dishes: {
                        ...basketItems.dishes,
                        [processedDishData.id]: processedDishData
                    }
                };
            }

            // Cập nhật state giỏ hàng
            setBasketItems(updatedBasketItems);

            // Đồng bộ với server
            try {
                await basketService.updateBasket(updatedBasketItems);
                setLoading(false);
                return processedDishData; // Trả về dữ liệu nếu thành công
            } catch (error) {
                console.error("Error syncing with server:", error);
                setLoading(false);
                return {}; // Trả về object rỗng nếu có lỗi
            }
        } catch (error) {
            console.error("Error adding dish to basket:", error);
            setLoading(false);
            return {}; // Trả về object rỗng nếu có lỗi
        }
    };
    // Xóa nguyên liệu khỏi giỏ hàng
    const removeIngredient = async (ingredientId) => {
        try {
            setLoading(true);

            const updatedBasketItems = {
                ...basketItems,
                ingredients: basketItems.ingredients.filter(item => item.id !== ingredientId)
            };

            setBasketItems(updatedBasketItems);

            // Đồng bộ với server
            await basketService.updateBasket(updatedBasketItems);
            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error removing ingredient from basket:", error);
            setLoading(false);
            return false;
        }
    };

    // Xóa món ăn khỏi giỏ hàng
    const removeDish = async (dishId) => {
        try {
            setLoading(true);

            const updatedDishes = { ...basketItems.dishes };
            delete updatedDishes[dishId];

            const updatedBasketItems = {
                ...basketItems,
                dishes: updatedDishes
            };

            setBasketItems(updatedBasketItems);

            // Đồng bộ với server
            await basketService.updateBasket(updatedBasketItems);
            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error removing dish from basket:", error);
            setLoading(false);
            return false;
        }
    };

    // Cập nhật giỏ hàng
    const updateBasket = async () => {
        try {
            setLoading(true);
            await basketService.updateBasket(basketItems);
            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error updating basket:", error);
            setLoading(false);
            return false;
        }
    };

    // Xóa toàn bộ giỏ hàng
    const clearBasket = async () => {
        try {
            setLoading(true);

            const emptyBasket = {
                ingredients: [],
                dishes: {}
            };

            setBasketItems(emptyBasket);

            // Xóa khỏi localStorage
            localStorage.removeItem('basketItems');

            // Đồng bộ với server
            await basketService.updateBasket(emptyBasket);

            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error clearing basket:", error);
            setLoading(false);
            return false;
        }
    };

    const getTotalItemCount = () => {
        const ingredientCount = basketItems.ingredients.length;
        const dishCount = Object.keys(basketItems.dishes).length;
        return ingredientCount + dishCount;
    };

    return (
        <BasketContext.Provider
            value={{
                basketItems,
                loading,
                addIngredient,
                addDish,
                removeIngredient,
                removeDish,
                updateBasket,
                clearBasket,
                getTotalItemCount
            }}
        >
            {children}
        </BasketContext.Provider>
    );
};

export default BasketContext;