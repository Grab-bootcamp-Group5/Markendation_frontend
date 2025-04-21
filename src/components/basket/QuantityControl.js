import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const QuantityControl = ({
    item, isDishIngredient = false, dishId = null, updateQuantity, removeItem, dishServings = 1
}) => {
    const actualQuantity = isDishIngredient && dishId
        ? item.quantity * (dishServings || 1)
        : item.quantity;

    const [inputValue, setInputValue] = useState(actualQuantity.toFixed(1));

    useEffect(() => {
        setInputValue(actualQuantity.toFixed(1));
    }, [actualQuantity]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleBlur = () => {
        const newQuantity = parseFloat(parseFloat(inputValue).toFixed(1));
        if (isNaN(newQuantity) || newQuantity <= 0) {
            setInputValue(actualQuantity.toFixed(1));
        } else {
            updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={() => {
                    const newQuantity = item.quantity > 0.1 ? parseFloat((item.quantity - 0.1).toFixed(1)) : 0.1;
                    updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
                    setInputValue(newQuantity.toFixed(1));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white"
            >
                <span className="text-base">−</span>
            </button>

            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="mx-3 px-4 py-2 bg-white border border-gray-300 rounded-full text-center w-24 text-base font-medium"
                aria-label="Quantity"
            />

            <button
                onClick={() => {
                    const newQuantity = parseFloat((item.quantity + 0.1).toFixed(1));
                    updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
                    setInputValue(newQuantity.toFixed(1));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white"
            >
                <span className="text-base">+</span>
            </button>

            <span className="ml-6 font-medium text-base">
                {item.unit}
            </span>

            <button
                onClick={() => removeItem(item.id, isDishIngredient, dishId)}
                className="ml-8 w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded"
            >
                <FiTrash2 size={20} />
            </button>
        </div>
    );
};

export default QuantityControl;