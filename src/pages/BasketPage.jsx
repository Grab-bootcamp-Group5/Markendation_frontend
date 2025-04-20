import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FiBookmark } from 'react-icons/fi';
import { HiOutlineCalculator } from "react-icons/hi";
import cartIcon from '../assets/images/cart.png';
import BasketHeader from '../components/basket/BasketHeader';
import IngredientSection from '../components/basket/IngredientSection';
import DishSection from '../components/basket/DishSection';

const BasketPage = () => {
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        ingredients: true,
        dishes: {},
        foodSection: true
    });

    // Fetch basket items from localStorage on component mount
    useEffect(() => {
        const storedBasket = localStorage.getItem('basketItems');
        if (storedBasket) {
            const parsedBasket = JSON.parse(storedBasket);
            setBasketItems(parsedBasket);

            // Initialize expanded state for all dishes
            const initialExpandedState = {};
            Object.keys(parsedBasket.dishes || {}).forEach(dishId => {
                initialExpandedState[dishId] = true; // Default expanded
            });

            setExpandedSections(prev => ({
                ...prev,
                dishes: initialExpandedState
            }));
        }
        setLoading(false);
    }, []);

    // Save basket items to localStorage whenever they change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('basketItems', JSON.stringify(basketItems));
        }
    }, [basketItems, loading]);

    // Toggle section expanded state
    const toggleSection = (section, id = null) => {
        if (section === 'ingredients') {
            setExpandedSections(prev => ({
                ...prev,
                ingredients: !prev.ingredients
            }));
        } else if (section === 'foodSection') {
            setExpandedSections(prev => ({
                ...prev,
                foodSection: !prev.foodSection
            }));
        } else if (section === 'dish' && id !== null) {
            setExpandedSections(prev => ({
                ...prev,
                dishes: {
                    ...prev.dishes,
                    [id]: !prev.dishes[id]
                }
            }));
        }
    };

    // Update quantity of an ingredient
    const updateQuantity = (id, newQuantity, isDishIngredient = false, dishId = null) => {
        if (isDishIngredient && dishId) {
            setBasketItems(prevState => {
                const updatedDishes = { ...prevState.dishes };
                if (updatedDishes[dishId]) {
                    const updatedIngredients = updatedDishes[dishId].ingredients.map(item => {
                        if (item.id === id) {
                            return { ...item, quantity: newQuantity };
                        }
                        return item;
                    });

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
        } else {
            setBasketItems(prevState => {
                const updatedIngredients = prevState.ingredients.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });

                return {
                    ...prevState,
                    ingredients: updatedIngredients
                };
            });
        }
    };

    // Remove an item
    const removeItem = (id, isDishIngredient = false, dishId = null) => {
        if (isDishIngredient && dishId) {
            // Remove ingredient from a dish
            setBasketItems(prevState => {
                const updatedDishes = { ...prevState.dishes };
                if (updatedDishes[dishId]) {
                    // Filter out the removed ingredient
                    const updatedIngredients = updatedDishes[dishId].ingredients.filter(
                        item => item.id !== id
                    );

                    // If no ingredients left, remove the entire dish
                    if (updatedIngredients.length === 0) {
                        delete updatedDishes[dishId];

                        // Also update expanded sections state
                        setExpandedSections(prev => {
                            const updatedExpanded = { ...prev.dishes };
                            delete updatedExpanded[dishId];
                            return {
                                ...prev,
                                dishes: updatedExpanded
                            };
                        });
                    } else {
                        // Update the dish with remaining ingredients
                        updatedDishes[dishId] = {
                            ...updatedDishes[dishId],
                            ingredients: updatedIngredients
                        };
                    }
                }

                return {
                    ...prevState,
                    dishes: updatedDishes
                };
            });
        } else if (dishId) {
            // Remove entire dish
            setBasketItems(prevState => {
                const updatedDishes = { ...prevState.dishes };
                delete updatedDishes[dishId];

                setExpandedSections(prev => {
                    const updatedExpanded = { ...prev.dishes };
                    delete updatedExpanded[dishId];
                    return {
                        ...prev,
                        dishes: updatedExpanded
                    };
                });

                return {
                    ...prevState,
                    dishes: updatedDishes
                };
            });
        } else {
            // Remove regular ingredient
            setBasketItems(prevState => ({
                ...prevState,
                ingredients: prevState.ingredients.filter(item => item.id !== id)
            }));
        }
    };

    // Calculate total number of items in the basket
    const getTotalItemCount = () => {
        // Count individual ingredients
        const ingredientCount = basketItems.ingredients.length;

        // Count total ingredients in dishes
        let dishIngredientsCount = 0;
        Object.values(basketItems.dishes).forEach(dish => {
            dishIngredientsCount += dish.ingredients.length;
        });

        return ingredientCount + dishIngredientsCount;
    };

    const saveCart = () => {
        alert("Đã lưu giỏ hàng!");
    };

    const startCheckout = () => {
        alert("Bắt đầu tính toán thanh toán!");
    };

    // Update servings for a dish
    const updateDishServings = (dishId, newServings) => {
        // If servings is reduced to 0, remove the dish entirely
        if (newServings <= 0) {
            removeItem(null, false, dishId); // Remove the entire dish
        } else {
            setBasketItems(prev => ({
                ...prev,
                dishes: {
                    ...prev.dishes,
                    [dishId]: {
                        ...prev.dishes[dishId],
                        servings: newServings
                    }
                }
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header basketCount={getTotalItemCount()} />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <BasketHeader saveCart={saveCart} />

                {loading ? (
                    <div className="bg-white p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : getTotalItemCount() === 0 ? (
                    <div className="bg-white p-8 text-center">
                        <h2 className="text-xl font-medium mb-4">Giỏ hàng trống</h2>
                        <Link to="/ingredients-bank" className="bg-green-600 text-white px-4 py-2 rounded">
                            Thêm nguyên liệu
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 border-t-0">
                        {/* Ingredients Section */}
                        {basketItems.ingredients.length > 0 && (
                            <IngredientSection
                                ingredients={basketItems.ingredients}
                                expanded={expandedSections.ingredients}
                                toggleSection={() => toggleSection('ingredients')}
                                updateQuantity={updateQuantity}
                                removeItem={removeItem}
                            />
                        )}

                        {/* Dishes Section */}
                        {Object.keys(basketItems.dishes).length > 0 && (
                            <DishSection
                                dishes={basketItems.dishes}
                                expandedSections={expandedSections}
                                toggleSection={toggleSection}
                                updateQuantity={updateQuantity}
                                removeItem={removeItem}
                                updateDishServings={updateDishServings}
                            />
                        )}

                        {/* Checkout Button */}
                        <div className="py-4 flex justify-center border-t border-gray-200 mt-4">
                            <button
                                onClick={startCheckout}
                                className="bg-green-600 text-white px-6 py-2 flex items-center justify-center rounded-md"
                            >
                                <HiOutlineCalculator className="w-5 h-5 mr-2" />
                                Bắt đầu tính toán
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default BasketPage;