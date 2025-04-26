import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { HiOutlineCalculator } from "react-icons/hi";
import BasketHeader from '../components/basket/BasketHeader';
import IngredientSection from '../components/basket/IngredientSection';
import DishSection from '../components/basket/DishSection';
import { basketService } from '../services/basketService';
import { toast } from 'react-toastify';

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

    useEffect(() => {
        const fetchBasket = async () => {
            setLoading(true);
            try {
                // Check if user is logged in
                if (localStorage.getItem('accessToken')) {
                    // Fetch basket from API
                    const basketData = await basketService.getBasket();
                    if (basketData) {
                        // Process the data to ensure all quantities are numbers
                        if (basketData.ingredients) {
                            basketData.ingredients = basketData.ingredients.map(item => ({
                                ...item,
                                quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0.1
                            }));
                        }

                        if (basketData.dishes) {
                            Object.keys(basketData.dishes).forEach(dishId => {
                                if (basketData.dishes[dishId].ingredients) {
                                    basketData.dishes[dishId].ingredients = basketData.dishes[dishId].ingredients.map(item => ({
                                        ...item,
                                        quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0.1
                                    }));
                                }
                            });
                        }

                        setBasketItems(basketData);

                        // Set initial expanded state for dishes
                        const initialExpandedState = {};
                        Object.keys(basketData.dishes || {}).forEach(dishId => {
                            initialExpandedState[dishId] = true;
                        });

                        setExpandedSections(prev => ({
                            ...prev,
                            dishes: initialExpandedState
                        }));
                    }
                } else {
                    // Not logged in, load from localStorage
                    const storedBasket = localStorage.getItem('basketItems');
                    if (storedBasket) {
                        const parsedBasket = JSON.parse(storedBasket);

                        // Process the data to ensure all quantities are numbers
                        if (parsedBasket.ingredients) {
                            parsedBasket.ingredients = parsedBasket.ingredients.map(item => ({
                                ...item,
                                quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0.1
                            }));
                        }

                        if (parsedBasket.dishes) {
                            Object.keys(parsedBasket.dishes).forEach(dishId => {
                                if (parsedBasket.dishes[dishId].ingredients) {
                                    parsedBasket.dishes[dishId].ingredients = parsedBasket.dishes[dishId].ingredients.map(item => ({
                                        ...item,
                                        quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0.1
                                    }));
                                }
                            });
                        }

                        setBasketItems(parsedBasket);

                        // Set initial expanded state for dishes
                        const initialExpandedState = {};
                        Object.keys(parsedBasket.dishes || {}).forEach(dishId => {
                            initialExpandedState[dishId] = true;
                        });

                        setExpandedSections(prev => ({
                            ...prev,
                            dishes: initialExpandedState
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching basket:", error);
                toast.error("Không thể tải giỏ hàng. Vui lòng thử lại sau.");

                // Fall back to localStorage if API fails
                const storedBasket = localStorage.getItem('basketItems');
                if (storedBasket) {
                    setBasketItems(JSON.parse(storedBasket));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBasket();
    }, []);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('basketItems', JSON.stringify(basketItems));
        }
    }, [basketItems, loading]);

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

    const updateQuantity = async (id, newQuantity, isDishIngredient = false, dishId = null) => {
        newQuantity = parseFloat(parseFloat(newQuantity).toFixed(1));

        // Update local state first for a responsive UI
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

            // Update in API if user is logged in
            // Note: Add API call here when update endpoint is available
        }
    };

    const removeItem = async (id, isDishIngredient = false, dishId = null) => {
        // Update local state first for a responsive UI
        if (isDishIngredient && dishId) {
            setBasketItems(prevState => {
                const updatedDishes = { ...prevState.dishes };
                if (updatedDishes[dishId]) {
                    const updatedIngredients = updatedDishes[dishId].ingredients.filter(
                        item => item.id !== id
                    );

                    if (updatedIngredients.length === 0) {
                        delete updatedDishes[dishId];

                        setExpandedSections(prev => {
                            const updatedExpanded = { ...prev.dishes };
                            delete updatedExpanded[dishId];
                            return {
                                ...prev,
                                dishes: updatedExpanded
                            };
                        });
                    } else {
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

            // Delete dish from API if user is logged in
            // Note: Add API call here when delete dish endpoint is available
        } else {
            setBasketItems(prevState => ({
                ...prevState,
                ingredients: prevState.ingredients.filter(item => item.id !== id)
            }));

            // Delete ingredient from API if user is logged in
            // Note: Add API call here when delete ingredient endpoint is available
        }
    };

    const getTotalItemCount = () => {
        const ingredientCount = basketItems.ingredients.length;

        let dishIngredientsCount = 0;
        Object.values(basketItems.dishes).forEach(dish => {
            dishIngredientsCount += dish.ingredients.length;
        });

        return ingredientCount + dishIngredientsCount;
    };

    const saveCart = async () => {
        // API call to save cart not provided in the documentation
        // This would be implemented when the endpoint is available
        toast.success("Đã lưu giỏ hàng!");
    };

    const updateDishServings = async (dishId, newServings) => {
        if (newServings <= 0) {
            removeItem(null, false, dishId);
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

            // Update in API if user is logged in
            // Note: Add API call here when update dish endpoint is available
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
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
                            <Link to='/calculate'>
                                <button className="bg-green-600 text-white px-6 py-2 flex items-center justify-center rounded-md">
                                    <HiOutlineCalculator className="w-5 h-5 mr-2" />
                                    Bắt đầu tính toán
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default BasketPage;