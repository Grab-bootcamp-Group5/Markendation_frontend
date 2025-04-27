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

    // Load basket from localStorage
    useEffect(() => {
        try {
            const storedBasket = localStorage.getItem('basketItems');
            if (storedBasket) {
                const parsedBasket = JSON.parse(storedBasket);

                // Đảm bảo phần ingredients và dishes tồn tại
                if (!parsedBasket.ingredients) parsedBasket.ingredients = [];
                if (!parsedBasket.dishes) parsedBasket.dishes = {};

                // Chuyển đổi số lượng của tất cả nguyên liệu thành số nguyên
                parsedBasket.ingredients = parsedBasket.ingredients.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity, 10) || 1 // Đảm bảo tối thiểu là 1
                }));

                // Xử lý các món ăn
                Object.keys(parsedBasket.dishes).forEach(dishId => {
                    const dish = parsedBasket.dishes[dishId];

                    // Chuyển đổi số phần ăn thành số nguyên
                    dish.servings = parseInt(dish.servings, 10) || 1;

                    // Chuyển đổi số lượng của tất cả nguyên liệu trong món ăn thành số nguyên
                    if (dish.ingredients) {
                        dish.ingredients = dish.ingredients.map(ingredient => ({
                            ...ingredient,
                            quantity: parseInt(ingredient.quantity, 10) || 1
                        }));
                    } else {
                        dish.ingredients = [];
                    }
                });

                setBasketItems(parsedBasket);

                // Thiết lập trạng thái mở rộng
                const initialExpandedState = {};
                Object.keys(parsedBasket.dishes).forEach(dishId => {
                    initialExpandedState[dishId] = true;
                });

                setExpandedSections(prev => ({
                    ...prev,
                    dishes: initialExpandedState
                }));
            }
        } catch (error) {
            console.error("Error loading basket:", error);
            // Nếu có lỗi, thiết lập giỏ hàng trống
            setBasketItems({
                ingredients: [],
                dishes: {}
            });
        }

        setLoading(false);
    }, []);

    // Save to localStorage when items change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('basketItems', JSON.stringify(basketItems));
        }
    }, [basketItems, loading]);

    // Toggle section visibility
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

    // Hàm cập nhật số lượng
    const updateQuantity = (id, newQuantity, isDishIngredient = false, dishId = null) => {
        // Đảm bảo newQuantity là số nguyên
        newQuantity = parseInt(newQuantity, 10);

        // Kiểm tra tính hợp lệ, tối thiểu là 1
        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
        }

        if (isDishIngredient && dishId) {
            // Cập nhật số lượng cho nguyên liệu trong món ăn
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
            // Cập nhật số lượng cho nguyên liệu độc lập
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

    // Remove item from basket
    const removeItem = (id, isDishIngredient = false, dishId = null) => {
        if (isDishIngredient && dishId) {
            // Remove ingredient from dish
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
            // Remove standalone ingredient
            setBasketItems(prevState => ({
                ...prevState,
                ingredients: prevState.ingredients.filter(item => item.id !== id)
            }));
        }
    };

    // Cập nhật số phần ăn của món ăn
    const updateDishServings = (dishId, newServings) => {
        // Đảm bảo newServings là số nguyên
        newServings = parseInt(newServings, 10);

        // Kiểm tra tính hợp lệ
        if (isNaN(newServings) || newServings <= 0) {
            // Nếu số lượng <= 0, xóa món ăn khỏi giỏ hàng
            removeItem(null, false, dishId);
            return;
        }

        // Cập nhật số lượng phần ăn
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
    };

    // Get total number of items
    const getTotalItemCount = () => {
        const ingredientCount = basketItems.ingredients.length;
        let dishIngredientsCount = 0;
        Object.values(basketItems.dishes).forEach(dish => {
            dishIngredientsCount += dish.ingredients.length;
        });
        return ingredientCount + dishIngredientsCount;
    };

    // Save cart to server
    const saveCart = async () => {
        try {
            await basketService.updateBasket(basketItems);
            toast.success("Đã lưu giỏ hàng thành công!");
        } catch (error) {
            console.error("Error saving basket:", error);
            toast.error("Không thể lưu giỏ hàng. Vui lòng thử lại sau.");
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