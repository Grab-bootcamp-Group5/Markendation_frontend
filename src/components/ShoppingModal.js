import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getIngredientById, getDishWithIngredients, images } from '../assets/assets';
import { basketService } from '../services/basketService';
import { useBasket } from '../context/BasketContext';

const ShoppingModal = ({ isOpen, onClose, type, itemData, searchQuery }) => {
    const [quantity, setQuantity] = useState(1);
    const [dishWithIngredients, setDishWithIngredients] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { basketItems } = useBasket();

    useEffect(() => {
        if (isOpen) {
            if (type === 'dish') {
                setQuantity(1);
            } else {
                setQuantity(1);
            }

            if (type === 'dish' && itemData && itemData.id) {
                const dish = getDishWithIngredients(itemData.id);
                setDishWithIngredients(dish);
            }
        } else {
            setDishWithIngredients(null);
        }
    }, [isOpen, type, itemData]);

    if (!isOpen) return null;

    const handleQuantityChange = (value) => {
        const parsedValue = parseFloat(value);

        if (type === 'dish') {
            const newValue = isNaN(parsedValue) ? 1 : Math.max(1, Math.round(parsedValue));
            setQuantity(newValue);
        } else {
            const newValue = isNaN(parsedValue) ? 0.1 : Math.max(0.1, parsedValue);
            setQuantity(newValue);
        }
    };

    const addToCart = async () => {
        setIsLoading(true);
        try {
            const storedBasket = localStorage.getItem('basketItems');
            let basketItems = storedBasket ? JSON.parse(storedBasket) : {
                ingredients: [],
                dishes: {}
            };

            if (type === 'dish' && dishWithIngredients) {
                if (basketItems.dishes[dishWithIngredients.id]) {
                    toast.warning(`${dishWithIngredients.name} đã có trong giỏ hàng!`);
                    setIsLoading(false);
                    return;
                }

                const formattedIngredients = dishWithIngredients.ingredients.map(ingredient => ({
                    id: ingredient.id,
                    name: ingredient.name,
                    image: ingredient.image,
                    quantity: 1,
                    unit: ingredient.unit,
                    category: ingredient.category
                }));

                basketItems.dishes[dishWithIngredients.id] = {
                    id: dishWithIngredients.id,
                    name: dishWithIngredients.name,
                    image: dishWithIngredients.image,
                    servings: quantity,
                    ingredients: formattedIngredients
                };

                // Note: Add API call for dish when endpoint is available

                toast.success(`Đã thêm ${dishWithIngredients.name} vào giỏ hàng!`);
            } else if ((type === 'ingredients' || type === 'search') && itemData) {
                const ingredientsArray = Array.isArray(itemData) ? itemData : [itemData];

                // Update local storage
                for (const ingredient of ingredientsArray) {
                    const existingItemIndex = basketItems.ingredients.findIndex(item => item.id === ingredient.id);

                    if (existingItemIndex !== -1) {
                        basketItems.ingredients[existingItemIndex].quantity += quantity;
                    } else {
                        basketItems.ingredients.push({
                            id: ingredient.id,
                            name: ingredient.name,
                            image: ingredient.image,
                            quantity: quantity,
                            unit: ingredient.unit,
                            category: ingredient.category
                        });
                    }

                    // Send to API if user is logged in
                    if (localStorage.getItem('accessToken')) {
                        await basketService.addIngredient({
                            id: ingredient.id,
                            vietnameseName: ingredient.vietnameseName || ingredient.name,
                            unit: ingredient.unit || 'piece',
                            quantity: quantity
                        });
                    }
                }

                if (type === 'search' && searchQuery) {
                    toast.success(`Đã thêm nguyên liệu cho "${searchQuery}" vào giỏ hàng!`);
                } else {
                    toast.success(`Đã thêm ${ingredientsArray.length > 1 ? 'các nguyên liệu' : ingredientsArray[0].name} vào giỏ hàng!`);
                }
            }

            localStorage.setItem('basketItems', JSON.stringify(basketItems));

            const event = new CustomEvent('basketUpdated');
            window.dispatchEvent(event);

            onClose();
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const getUnit = () => {
        if (type === 'dish') {
            return 'phần';
        } else if ((type === 'ingredients' || type === 'search') && itemData) {
            if (Array.isArray(itemData) && itemData.length > 0) {
                const firstItem = itemData[0];
                return firstItem.unit;
            }
            const ingredient = Array.isArray(itemData) ? itemData[0] : itemData;
            return ingredient?.unit;
        }
        return 'KG';
    };

    // Xác định title, image và ingredients để hiển thị
    let title = '';
    let image = '';
    let ingredients = [];
    let showMultipleIngredients = false;

    if (type === 'dish' && dishWithIngredients) {
        title = dishWithIngredients.name;
        image = dishWithIngredients.image;
        ingredients = dishWithIngredients.ingredients.map(ing => ({
            name: ing.name,
            category: ing.category
        }));
    } else if (type === 'ingredients') {
        if (Array.isArray(itemData) && itemData.length > 1) {
            title = "Danh sách nguyên liệu";
            showMultipleIngredients = true;
            image = itemData[0]?.image || '';
        } else {
            const ingredient = Array.isArray(itemData) ? itemData[0] : itemData;
            title = ingredient?.name || 'Nguyên liệu';
            image = ingredient?.image || '';
        }
    } else if (type === 'search') {
        title = `Kết quả cho "${searchQuery}"`;
        showMultipleIngredients = Array.isArray(itemData) && itemData.length > 0;
        image = Array.isArray(itemData) && itemData.length > 0 ? itemData[0].image : '';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-auto relative">
                {/* Close button at top right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FiX size={24} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left section with text */}
                    <div className="p-6 flex-1">
                        {/* Title */}
                        <h2 className="text-2xl font-bold mb-6">
                            {title}
                        </h2>

                        {/* Ingredients list for dishes */}
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

                        {/* Multiple ingredients list for search/uploaded image results */}
                        {showMultipleIngredients && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Nguyên liệu được nhận diện</h3>
                                <ul className="space-y-2">
                                    {Array.isArray(itemData) && itemData.map((item, index) => (
                                        <li key={index} className="flex items-center space-x-2 py-1">
                                            {item.image && (
                                                <div className="w-8 h-8 flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain rounded-full"
                                                    />
                                                </div>
                                            )}
                                            <span className="text-gray-700">{item.name}</span>
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
                                    min={type === 'dish' ? "1" : "0.1"}
                                    step={type === 'dish' ? "1" : "0.1"}
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
                            onClick={addToCart}
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="mr-2">
                                    <img className="h-6 w-6" src={images.cart} />
                                </span>
                            )}
                            {isLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                        </button>
                    </div>

                    {/* Right section with image */}
                    <div className="flex-shrink-0 w-full md:w-64 flex items-center justify-center p-4">
                        <div className="w-48 h-64 overflow-hidden rounded-3xl bg-gray-100 flex items-center justify-center">
                            {image ? (
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                // Hiển thị icon mặc định nếu không có hình ảnh
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