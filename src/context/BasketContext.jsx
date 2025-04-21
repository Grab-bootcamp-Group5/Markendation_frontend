import React, { createContext, useState, useContext, useEffect } from 'react';

const BasketContext = createContext();

export const useBasket = () => useContext(BasketContext);

export const BasketProvider = ({ children }) => {
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedBasket = localStorage.getItem('basketItems');
        if (storedBasket) {
            setBasketItems(JSON.parse(storedBasket));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('basketItems', JSON.stringify(basketItems));
            const event = new CustomEvent('basketUpdated');
            window.dispatchEvent(event);
        }
    }, [basketItems, loading]);

    const addIngredient = (ingredient) => {
        setBasketItems(prevState => {
            const existingItemIndex = prevState.ingredients.findIndex(item => item.id === ingredient.id);

            if (existingItemIndex !== -1) {
                const updatedIngredients = [...prevState.ingredients];
                updatedIngredients[existingItemIndex] = {
                    ...updatedIngredients[existingItemIndex],
                    quantity: updatedIngredients[existingItemIndex].quantity + 1
                };

                return {
                    ...prevState,
                    ingredients: updatedIngredients
                };
            } else {
                return {
                    ...prevState,
                    ingredients: [...prevState.ingredients, {
                        ...ingredient,
                        quantity: 1,
                        unit: ingredient.category === "Dầu ăn" ? "Lít" : "KG"
                    }]
                };
            }
        });
    };

    const addDish = (dish) => {
        setBasketItems(prevState => {
            if (prevState.dishes[dish.id]) {
                return prevState;
            }

            return {
                ...prevState,
                dishes: {
                    ...prevState.dishes,
                    [dish.id]: dish
                }
            };
        });
    };

    const updateIngredientQuantity = (id, amount) => {
        setBasketItems(prevState => {
            const updatedIngredients = prevState.ingredients.map(item => {
                if (item.id === id) {
                    const newQuantity = item.quantity + amount;
                    if (newQuantity <= 0) {
                        return null;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean);

            return {
                ...prevState,
                ingredients: updatedIngredients
            };
        });
    };

    const removeIngredient = (id) => {
        setBasketItems(prevState => ({
            ...prevState,
            ingredients: prevState.ingredients.filter(item => item.id !== id)
        }));
    };

    const updateDishIngredientQuantity = (dishId, ingredientId, amount) => {
        setBasketItems(prevState => {
            const updatedDishes = { ...prevState.dishes };

            if (updatedDishes[dishId]) {
                const updatedIngredients = updatedDishes[dishId].ingredients.map(item => {
                    if (item.id === ingredientId) {
                        const newQuantity = item.quantity + amount;
                        if (newQuantity <= 0) {
                            return null;
                        }
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                }).filter(Boolean);

                updatedDishes[dishId] = {
                    ...updatedDishes[dishId],
                    ingredients: updatedIngredients
                };
            }

            return {
                ...prevState,
                dishes: updatedDishes
            };
        });
    };

    const removeDish = (dishId) => {
        setBasketItems(prevState => {
            const updatedDishes = { ...prevState.dishes };
            delete updatedDishes[dishId];

            return {
                ...prevState,
                dishes: updatedDishes
            };
        });
    };

    const getTotalItemCount = () => {
        const ingredientCount = basketItems.ingredients.reduce((total, item) => total + item.quantity, 0);

        let dishIngredientCount = 0;
        Object.values(basketItems.dishes).forEach(dish => {
            dishIngredientCount += dish.ingredients.reduce((total, item) => total + item.quantity, 0);
        });

        return ingredientCount + dishIngredientCount;
    };

    const clearBasket = () => {
        setBasketItems({
            ingredients: [],
            dishes: {}
        });
    };

    const value = {
        basketItems,
        loading,
        addIngredient,
        addDish,
        updateIngredientQuantity,
        removeIngredient,
        updateDishIngredientQuantity,
        removeDish,
        getTotalItemCount,
        clearBasket
    };

    return (
        <BasketContext.Provider value={value}>
            {children}
        </BasketContext.Provider>
    );
};

export default BasketContext; 