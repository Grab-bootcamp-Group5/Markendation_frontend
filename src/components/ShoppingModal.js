import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getIngredientById, getDishWithIngredients, images } from '../assets/assets';
import { useBasket } from '../context/BasketContext';

const ShoppingModal = ({ isOpen, onClose, type, itemData, searchQuery }) => {
    const [quantity, setQuantity] = useState(1);
    const [dishWithIngredients, setDishWithIngredients] = useState(null);
    const { addIngredient, addDish } = useBasket(); // Use context functions directly

    // Reset modal when opened
    useEffect(() => {
        if (isOpen) {
            // Reset to default value
            setQuantity(1);

            // Get dish information if needed
            if (type === 'dish' && itemData) {
                // Check if itemData already has ingredients
                if (itemData.ingredients && itemData.ingredients.length > 0) {
                    setDishWithIngredients(itemData);
                } else if (itemData.id) {
                    // Otherwise try to get dish details
                    const dish = getDishWithIngredients(itemData.id);
                    setDishWithIngredients(dish || itemData);
                } else {
                    setDishWithIngredients(itemData);
                }
            }
        } else {
            setDishWithIngredients(null);
        }
    }, [isOpen, type, itemData]);

    if (!isOpen) return null;

    // Handle quantity change
    const handleQuantityChange = (value) => {
        const parsedValue = parseInt(value, 10);
        setQuantity(isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue);
    };

    // Handle adding to cart
    const handleAddToCart = async () => {
        try {
            if (type === 'dish' && dishWithIngredients) {
                // Process dish data for the cart
                const dish = {
                    id: dishWithIngredients.id || `dish-${Date.now()}`, // Fallback ID if none exists
                    name: dishWithIngredients.name,
                    vietnameseName: dishWithIngredients.vietnameseName || dishWithIngredients.name,
                    image: dishWithIngredients.imageUrl || dishWithIngredients.image,
                    servings: quantity,
                    ingredients: (dishWithIngredients.ingredients || []).map(ingredient => ({
                        id: ingredient.id || `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: ingredient.name,
                        vietnameseName: ingredient.vietnameseName || ingredient.name,
                        image: ingredient.imageUrl || ingredient.image,
                        quantity: 1,
                        unit: ingredient.unit || 'g',
                        category: ingredient.category || 'Khác'
                    }))
                };

                // Add dish to basket using context function
                await addDish(dish);
                toast.success(`Đã thêm ${dish.vietnameseName || dish.name} vào giỏ hàng!`);
            } else if ((type === 'ingredients' || type === 'search') && itemData) {
                // Process ingredients for the cart
                const ingredientsArray = Array.isArray(itemData) ? itemData : [itemData];

                for (const ingredient of ingredientsArray) {
                    const processedIngredient = {
                        id: ingredient.id || `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        vietnameseName: ingredient.vietnameseName || ingredient.name,
                        name: ingredient.name,
                        image: ingredient.imageUrl || ingredient.image,
                        quantity: quantity,
                        unit: ingredient.unit || 'g',
                        category: ingredient.category || 'Khác'
                    };

                    // Add ingredient to basket using context function
                    await addIngredient(processedIngredient);
                }

                if (type === 'search' && searchQuery) {
                    toast.success(`Đã thêm nguyên liệu cho "${searchQuery}" vào giỏ hàng!`);
                } else {
                    toast.success(
                        `Đã thêm ${ingredientsArray.length > 1
                            ? 'các nguyên liệu'
                            : ingredientsArray[0].vietnameseName || ingredientsArray[0].name} vào giỏ hàng!`
                    );
                }
            }

            // Trigger basket updated event
            window.dispatchEvent(new CustomEvent('basketUpdated'));

            // Close modal
            onClose();
        } catch (error) {
            console.error("Error adding items to basket:", error);
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    const getUnit = () => {
        if (type === 'dish') {
            return 'phần';
        } else if ((type === 'ingredients' || type === 'search') && itemData) {
            if (Array.isArray(itemData) && itemData.length > 0) {
                return itemData[0].unit || 'g';
            }
            return Array.isArray(itemData) ? (itemData[0]?.unit || 'g') : (itemData?.unit || 'g');
        }
        return 'g';
    };

    // Determine title, image and ingredients
    let title = '';
    let image = '';
    let ingredients = [];
    let showMultipleIngredients = false;

    if (type === 'dish' && dishWithIngredients) {
        title = dishWithIngredients.vietnameseName || dishWithIngredients.name;
        image = dishWithIngredients.imageUrl || dishWithIngredients.image;
        ingredients = (dishWithIngredients.ingredients || []).map(ing => ({
            name: ing.vietnameseName || ing.name,
            category: ing.category || 'Khác'
        }));
    } else if (type === 'ingredients') {
        if (Array.isArray(itemData) && itemData.length > 1) {
            title = "Danh sách nguyên liệu";
            showMultipleIngredients = true;
            image = itemData[0]?.imageUrl || itemData[0]?.image || '';
        } else {
            const ingredient = Array.isArray(itemData) ? itemData[0] : itemData;
            title = ingredient?.vietnameseName || ingredient?.name || 'Nguyên liệu';
            image = ingredient?.imageUrl || ingredient?.image || '';
        }
    } else if (type === 'search') {
        title = `Kết quả cho "${searchQuery}"`;
        showMultipleIngredients = Array.isArray(itemData) && itemData.length > 0;
        image = Array.isArray(itemData) && itemData.length > 0
            ? (itemData[0].imageUrl || itemData[0].image)
            : '';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-auto relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FiX size={24} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left content */}
                    <div className="p-6 flex-1">
                        {/* Title */}
                        <h2 className="text-2xl font-bold mb-6">
                            {title}
                        </h2>

                        {/* Dish ingredients list */}
                        {type === 'dish' && ingredients.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Thành phần</h3>
                                <ul className="space-y-2">
                                    {ingredients.map((ing, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{ing.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Multiple ingredients display */}
                        {showMultipleIngredients && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Nguyên liệu được nhận diện</h3>
                                <ul className="space-y-2">
                                    {Array.isArray(itemData) && itemData.map((item, index) => (
                                        <li key={index} className="flex items-center space-x-2 py-1">
                                            {(item.image || item.imageUrl) && (
                                                <div className="w-8 h-8 flex-shrink-0">
                                                    <img
                                                        src={item.imageUrl || item.image}
                                                        alt={item.vietnameseName || item.name}
                                                        className="w-full h-full object-contain rounded-full"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/default-ingredient.jpg';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <span className="text-gray-700">{item.vietnameseName || item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quantity input */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xl font-bold">
                                    Nhập số lượng mong muốn:
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full text-center"
                                />
                                <span className="ml-2 text-gray-500">
                                    {getUnit()}
                                </span>
                            </div>
                        </div>

                        {/* Add to cart button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                            <span className="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                            Thêm vào giỏ hàng
                        </button>
                    </div>

                    {/* Right image section */}
                    <div className="flex-shrink-0 w-full md:w-64 flex items-center justify-center p-4">
                        <div className="w-48 h-64 overflow-hidden rounded-3xl bg-gray-100 flex items-center justify-center">
                            {image ? (
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/default-dish.jpg';
                                    }}
                                />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 15 8 11C9 10 10 10 11 11L16 16" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 14 16 12C17 11 18 11 19 12L20 13" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                                    </svg>
                                    <span className="text-sm">Không có hình ảnh</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingModal;