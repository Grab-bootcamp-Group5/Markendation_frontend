import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const BasketContext = createContext();

// Custom hook for using basket context
export const useBasket = () => useContext(BasketContext);

// Provider component
export const BasketProvider = ({ children }) => {
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(true);

    // Initialize basket from localStorage
    useEffect(() => {
        const storedBasket = localStorage.getItem('basketItems');
        if (storedBasket) {
            setBasketItems(JSON.parse(storedBasket));
        }
        setLoading(false);
    }, []);

    // Save to localStorage whenever basket changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('basketItems', JSON.stringify(basketItems));
            // Dispatch event for components that need to know when basket updates
            const event = new CustomEvent('basketUpdated');
            window.dispatchEvent(event);
        }
    }, [basketItems, loading]);

    // Add an ingredient to the basket
    const addIngredient = (ingredient) => {
        setBasketItems(prevState => {
            // Check if ingredient already exists
            const existingItemIndex = prevState.ingredients.findIndex(item => item.id === ingredient.id);

            if (existingItemIndex !== -1) {
                // Increment quantity if already in basket
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
                // Add new ingredient to basket
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

    // Add a dish with its ingredients to the basket
    const addDish = (dish) => {
        setBasketItems(prevState => {
            // If dish already exists, just return current state
            if (prevState.dishes[dish.id]) {
                return prevState;
            }

            // Add new dish with its ingredients to basket
            return {
                ...prevState,
                dishes: {
                    ...prevState.dishes,
                    [dish.id]: dish
                }
            };
        });
    };

    // Update quantity of an ingredient
    const updateIngredientQuantity = (id, amount) => {
        setBasketItems(prevState => {
            const updatedIngredients = prevState.ingredients.map(item => {
                if (item.id === id) {
                    const newQuantity = item.quantity + amount;
                    if (newQuantity <= 0) {
                        return null; // Will be filtered out below
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean); // Remove null items

            return {
                ...prevState,
                ingredients: updatedIngredients
            };
        });
    };

    // Remove an ingredient
    const removeIngredient = (id) => {
        setBasketItems(prevState => ({
            ...prevState,
            ingredients: prevState.ingredients.filter(item => item.id !== id)
        }));
    };

    // Update quantity of an ingredient in a dish
    const updateDishIngredientQuantity = (dishId, ingredientId, amount) => {
        setBasketItems(prevState => {
            const updatedDishes = { ...prevState.dishes };

            if (updatedDishes[dishId]) {
                const updatedIngredients = updatedDishes[dishId].ingredients.map(item => {
                    if (item.id === ingredientId) {
                        const newQuantity = item.quantity + amount;
                        if (newQuantity <= 0) {
                            return null; // Will be filtered out below
                        }
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                }).filter(Boolean); // Remove null items

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

    // Remove a dish
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

    // Calculate total number of items in the basket
    const getTotalItemCount = () => {
        const ingredientCount = basketItems.ingredients.reduce((total, item) => total + item.quantity, 0);

        let dishIngredientCount = 0;
        Object.values(basketItems.dishes).forEach(dish => {
            dishIngredientCount += dish.ingredients.reduce((total, item) => total + item.quantity, 0);
        });

        return ingredientCount + dishIngredientCount;
    };

    // Clear the entire basket
    const clearBasket = () => {
        setBasketItems({
            ingredients: [],
            dishes: {}
        });
    };

    // Context value that will be provided
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