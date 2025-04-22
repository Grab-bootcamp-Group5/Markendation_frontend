import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getIngredientById, getDishWithIngredients } from '../assets/assets';

const ShoppingModal = ({ isOpen, onClose, type, itemData, searchQuery }) => {
    const [quantity, setQuantity] = useState(1);
    const [dishWithIngredients, setDishWithIngredients] = useState(null);

    useEffect(() => {
        // Reset state when modal opens
        if (isOpen) {
            setQuantity(1);

            // If we have a dish item, fetch its ingredients
            if (type === 'dish' && itemData) {
                const dish = getDishWithIngredients(itemData.id);
                setDishWithIngredients(dish);
            }
        }
    }, [isOpen, type, itemData]);

    const handleQuantityChange = (value) => {
        // Parse the value to a float and ensure it's not less than 0.1
        const parsedValue = parseFloat(value);
        const newValue = isNaN(parsedValue) ? 0.1 : Math.max(0.1, parsedValue);
        setQuantity(newValue);
    };

    const addToCart = () => {
        const storedBasket = localStorage.getItem('basketItems');
        let basketItems = storedBasket ? JSON.parse(storedBasket) : {
            ingredients: [],
            dishes: {}
        };

        if (type === 'dish' && dishWithIngredients) {
            // Check if the dish already exists in the basket
            if (basketItems.dishes[dishWithIngredients.id]) {
                toast.warning(`${dishWithIngredients.name} đã có trong giỏ hàng!`);
                return;
            }

            // Add the dish with calculated quantities based on quantity input
            const formattedIngredients = dishWithIngredients.ingredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.name,
                image: ingredient.image,
                quantity: quantity, // Use the single quantity input
                unit: ingredient.category === "Dầu ăn" ? "Lít" : "KG",
                category: ingredient.category
            }));

            basketItems.dishes[dishWithIngredients.id] = {
                id: dishWithIngredients.id,
                name: dishWithIngredients.name,
                image: dishWithIngredients.image,
                servings: quantity,
                ingredients: formattedIngredients
            };

            toast.success(`Đã thêm ${dishWithIngredients.name} vào giỏ hàng!`);
        } else if (type === 'ingredients' && itemData) {
            // Single ingredient or array of ingredients
            const ingredientsArray = Array.isArray(itemData) ? itemData : [itemData];

            ingredientsArray.forEach(ingredient => {
                const existingItemIndex = basketItems.ingredients.findIndex(item => item.id === ingredient.id);

                if (existingItemIndex !== -1) {
                    // Update quantity if the ingredient already exists
                    basketItems.ingredients[existingItemIndex].quantity += quantity;
                } else {
                    // Add new ingredient
                    basketItems.ingredients.push({
                        id: ingredient.id,
                        name: ingredient.name,
                        image: ingredient.image,
                        quantity: quantity,
                        unit: ingredient.category === "Dầu ăn" ? "Lít" : "KG",
                        category: ingredient.category
                    });
                }
            });

            toast.success(`Đã thêm ${ingredientsArray.length > 1 ? 'các nguyên liệu' : ingredientsArray[0].name} vào giỏ hàng!`);
        } else if (type === 'search' && searchQuery) {
            // Handle search-based shopping
            toast.info(`Đã thêm nguyên liệu cho "${searchQuery}" vào giỏ hàng!`);
        }

        // Save the updated basket to localStorage
        localStorage.setItem('basketItems', JSON.stringify(basketItems));

        // Dispatch event to notify other components about the basket update
        const event = new CustomEvent('basketUpdated');
        window.dispatchEvent(event);

        // Close the modal
        onClose();
    };

    // Helper to get the unit for display
    const getUnit = () => {
        if (type === 'dish') {
            return 'phần';
        } else if (type === 'ingredients' && itemData) {
            const ingredient = Array.isArray(itemData) ? itemData[0] : itemData;
            return ingredient.category === "Dầu ăn" ? "Lít" : "KG";
        }
        return 'KG';
    };

    if (!isOpen) return null;

    let title = '';
    let image = '';
    let ingredients = [];

    if (type === 'dish' && dishWithIngredients) {
        title = dishWithIngredients.name;
        image = dishWithIngredients.image;
        ingredients = dishWithIngredients.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.category === "Dầu ăn" ? `${200} ml` : `${200} gram`,
            category: ing.category
        }));
    } else if (type === 'ingredients') {
        const ingredient = Array.isArray(itemData) ? itemData[0] : itemData;
        title = ingredient.name;
        image = ingredient.image;
    } else if (type === 'search') {
        title = `Kết quả cho "${searchQuery}"`;
        // Placeholder image or default
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

                        {/* Ingredients list if applicable */}
                        {ingredients.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Thành phần (ingre k có phần này)</h3>
                                <ul className="space-y-2">
                                    {ingredients.map((ing, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{ing.quantity} {ing.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quantity input */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xl font-bold">
                                    Nhập lượng mong muốn của bạn:
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full text-center"
                                />
                                <span className="ml-2 text-gray-500">
                                    gram/lít/cái (dựa vào sản phẩm mik chọn là gì)
                                </span>
                            </div>
                        </div>

                        {/* Add to cart button */}
                        <button
                            onClick={addToCart}
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

                    {/* Right section with image */}
                    <div className="flex-shrink-0 w-full md:w-64 flex items-center justify-center p-4">
                        <div className="w-48 h-64 overflow-hidden rounded-3xl">
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingModal;