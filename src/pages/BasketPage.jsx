import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineCalculator } from "react-icons/hi";
import BasketHeader from '../components/basket/BasketHeader';
import IngredientSection from '../components/basket/IngredientSection';
import DishSection from '../components/basket/DishSection';
import { useBasket } from '../context/BasketContext';
import { basketService } from '../services/basketService';
import { toast } from 'react-toastify';

const BasketPage = () => {
    const navigate = useNavigate();

    // Sử dụng BasketContext
    const {
        basketItems,
        loading,
        updateBasket,
        syncStatus,
        removeIngredient,
        removeDish,
        getTotalItemCount
    } = useBasket();

    const [expandedSections, setExpandedSections] = useState({
        ingredients: true,
        dishes: {},
        foodSection: true
    });

    const [calculating, setCalculating] = useState(false);

    // Thiết lập trạng thái mở rộng ban đầu cho các món ăn
    useEffect(() => {
        if (!loading && basketItems.dishes) {
            const initialExpandedState = {};
            Object.keys(basketItems.dishes).forEach(dishId => {
                initialExpandedState[dishId] = true;
            });

            setExpandedSections(prev => ({
                ...prev,
                dishes: initialExpandedState
            }));
        }
    }, [loading, basketItems.dishes]);

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

    // Hàm cập nhật số lượng nguyên liệu
    const handleUpdateQuantity = async (id, newQuantity, isDishIngredient = false, dishId = null) => {
        try {
            let updatedBasketItems = { ...basketItems };

            if (isDishIngredient && dishId) {
                // Cập nhật số lượng cho nguyên liệu trong món ăn
                if (updatedBasketItems.dishes[dishId]) {
                    const updatedIngredients = updatedBasketItems.dishes[dishId].ingredients.map(item => {
                        if (item.id === id) {
                            return { ...item, quantity: newQuantity };
                        }
                        return item;
                    });

                    updatedBasketItems.dishes[dishId] = {
                        ...updatedBasketItems.dishes[dishId],
                        ingredients: updatedIngredients
                    };
                }
            } else {
                // Cập nhật số lượng cho nguyên liệu độc lập
                updatedBasketItems.ingredients = updatedBasketItems.ingredients.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });
            }

            // Cập nhật state trong context (tự động đồng bộ với server)
            await updateBasket(updatedBasketItems);
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Không thể cập nhật số lượng. Vui lòng thử lại sau.");
        }
    };

    // Hàm xóa item
    const handleRemoveItem = async (id, isDishIngredient = false, dishId = null) => {
        try {
            let updatedBasketItems = { ...basketItems };

            if (isDishIngredient && dishId) {
                // Xóa nguyên liệu trong món ăn
                if (updatedBasketItems.dishes[dishId]) {
                    const updatedIngredients = updatedBasketItems.dishes[dishId].ingredients.filter(
                        item => item.id !== id
                    );

                    if (updatedIngredients.length === 0) {
                        // Nếu không còn nguyên liệu, xóa món ăn
                        delete updatedBasketItems.dishes[dishId];

                        // Cập nhật trạng thái expanded
                        setExpandedSections(prev => {
                            const updatedExpanded = { ...prev.dishes };
                            delete updatedExpanded[dishId];
                            return {
                                ...prev,
                                dishes: updatedExpanded
                            };
                        });
                    } else {
                        // Cập nhật danh sách nguyên liệu của món ăn
                        updatedBasketItems.dishes[dishId] = {
                            ...updatedBasketItems.dishes[dishId],
                            ingredients: updatedIngredients
                        };
                    }

                    // Cập nhật state trong context (tự động đồng bộ với server)
                    await updateBasket(updatedBasketItems);
                }
            } else if (dishId) {
                // Xóa toàn bộ món ăn
                delete updatedBasketItems.dishes[dishId];

                // Cập nhật trạng thái expanded
                setExpandedSections(prev => {
                    const updatedExpanded = { ...prev.dishes };
                    delete updatedExpanded[dishId];
                    return {
                        ...prev,
                        dishes: updatedExpanded
                    };
                });

                // Cập nhật state trong context (tự động đồng bộ với server)
                await updateBasket(updatedBasketItems);
            } else {
                // Sử dụng hàm removeIngredient từ context
                await removeIngredient(id);
            }
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Không thể xóa mục. Vui lòng thử lại sau.");
        }
    };

    // Cập nhật số phần ăn của món ăn
    const handleUpdateDishServings = async (dishId, newServings) => {
        try {
            let updatedBasketItems = { ...basketItems };

            if (newServings <= 0) {
                // Nếu số lượng <= 0, xóa món ăn
                delete updatedBasketItems.dishes[dishId];

                // Cập nhật trạng thái expanded
                setExpandedSections(prev => {
                    const updatedExpanded = { ...prev.dishes };
                    delete updatedExpanded[dishId];
                    return {
                        ...prev,
                        dishes: updatedExpanded
                    };
                });
            } else {
                // Cập nhật số lượng phần ăn
                updatedBasketItems.dishes[dishId] = {
                    ...updatedBasketItems.dishes[dishId],
                    servings: newServings
                };
            }

            // Cập nhật state trong context (tự động đồng bộ với server)
            await updateBasket(updatedBasketItems);
        } catch (error) {
            console.error("Error updating dish servings:", error);
            toast.error("Không thể cập nhật số phần ăn. Vui lòng thử lại sau.");
        }
    };

    // Lưu giỏ hàng yêu thích
    const saveFavoriteCart = async () => {
        try {
            // Đảm bảo giỏ hàng đã được đồng bộ với server trước khi lưu
            if (syncStatus !== 'synced') {
                await updateBasket();
            }

            // Gọi API lưu giỏ hàng yêu thích (cần triển khai API này)
            // Ví dụ: await basketService.saveFavoriteBasket(basketItems);
            toast.success("Đã lưu giỏ hàng yêu thích thành công!");
        } catch (error) {
            console.error("Error saving favorite basket:", error);
            toast.error("Không thể lưu giỏ hàng yêu thích. Vui lòng thử lại sau.");
        }
    };

    // Hàm tính toán giỏ hàng
    const handleCalculateCart = async () => {
        try {
            setCalculating(true);

            // Đảm bảo giỏ hàng đã được đồng bộ với server trước khi tính toán
            if (syncStatus !== 'synced') {
                await updateBasket();
            }

            // Gọi API tính toán
            const result = await basketService.calculateBasket();

            // Hiển thị kết quả tính toán trong console
            console.log("Kết quả tính toán giỏ hàng:", result);
            localStorage.setItem('basket result:', JSON.stringify(result));

            // Hiển thị thông báo thành công
            toast.success("Đã tính toán giỏ hàng thành công!");

            // Chuyển hướng đến trang tính toán với kết quả
            navigate('/calculate', { state: { calculationResult: result } });

            setCalculating(false);
        } catch (error) {
            console.error("Error calculating basket:", error);
            toast.error("Không thể tính toán giỏ hàng. Vui lòng thử lại sau.");
            setCalculating(false);
        }
    };

    // Tính tổng số mục trong giỏ hàng
    const totalItemCount = () => {
        if (!basketItems) return 0;

        const ingredientCount = basketItems.ingredients?.length || 0;
        let dishIngredientsCount = 0;

        if (basketItems.dishes) {
            Object.values(basketItems.dishes).forEach(dish => {
                dishIngredientsCount += dish.ingredients?.length || 0;
            });
        }

        return ingredientCount + dishIngredientsCount;
    };

    // Hiển thị trạng thái đồng bộ
    const renderSyncStatus = () => {
        if (syncStatus === 'pending') {
            return (
                <div className="text-yellow-600 text-xs flex items-center">
                    <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-yellow-600 rounded-full mr-1"></div>
                    Đang đồng bộ...
                </div>
            );
        } else if (syncStatus === 'error') {
            return (
                <div className="text-red-600 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Đồng bộ thất bại
                </div>
            );
        } else {
            return (
                <div className="text-green-600 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Đã đồng bộ
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <BasketHeader saveCart={saveFavoriteCart} />

                {/* Hiển thị trạng thái đồng bộ */}
                <div className="mb-2 flex justify-end">
                    {renderSyncStatus()}
                </div>

                {loading || calculating ? (
                    <div className="bg-white p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : totalItemCount() === 0 ? (
                    <div className="bg-white p-8 text-center">
                        <h2 className="text-xl font-medium mb-4">Giỏ hàng trống</h2>
                        <Link to="/ingredients-bank" className="bg-green-600 text-white px-4 py-2 rounded">
                            Thêm nguyên liệu
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 border-t-0">
                        {/* Ingredients Section */}
                        {basketItems.ingredients && basketItems.ingredients.length > 0 && (
                            <IngredientSection
                                ingredients={basketItems.ingredients}
                                expanded={expandedSections.ingredients}
                                toggleSection={() => toggleSection('ingredients')}
                                updateQuantity={handleUpdateQuantity}
                                removeItem={handleRemoveItem}
                            />
                        )}

                        {/* Dishes Section */}
                        {basketItems.dishes && Object.keys(basketItems.dishes).length > 0 && (
                            <DishSection
                                dishes={basketItems.dishes}
                                expandedSections={expandedSections}
                                toggleSection={toggleSection}
                                updateQuantity={handleUpdateQuantity}
                                removeItem={handleRemoveItem}
                                updateDishServings={handleUpdateDishServings}
                            />
                        )}

                        {/* Checkout Button */}
                        <div className="py-4 flex justify-center border-t border-gray-200 mt-4">
                            <button
                                onClick={handleCalculateCart}
                                className="bg-green-600 text-white px-6 py-2 flex items-center justify-center rounded-md"
                                disabled={calculating || syncStatus === 'pending'}
                            >
                                <HiOutlineCalculator className="w-5 h-5 mr-2" />
                                {calculating ? "Đang tính toán..." : "Bắt đầu tính toán"}
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