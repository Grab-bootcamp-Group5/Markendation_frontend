import React, { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const QuantityControl = ({
    item, isDishIngredient = false, dishId = null, updateQuantity, removeItem, dishServings = 1
}) => {
    // Calculate actual quantity based on whether it's a dish ingredient
    // const actualQuantity = isDishIngredient && dishId
    //     ? (item.quantity * (dishServings || 1)).toFixed(1)
    //     : item.quantity.toFixed(1);

    // Local state to manage the input value
    const [inputValue, setInputValue] = useState(item.quantity.toFixed(1));

    // Handle direct input change
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Handle blur event (when user clicks away from input)
    const handleBlur = () => {
        let newValue = parseFloat(inputValue);

        // Validate the new value
        if (isNaN(newValue) || newValue <= 0) {
            // Reset to current value if invalid
            setInputValue(item.quantity.toFixed(1));
        } else {
            // Round to 1 decimal place
            newValue = parseFloat(newValue.toFixed(1));
            // Update the quantity in parent component
            updateQuantity(item.id, newValue, isDishIngredient, dishId);
            // Update local input value
            setInputValue(newValue.toFixed(1));
        }
    };

    // Handle key press (Enter key)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Trigger the blur event
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={() => {
                    // Decrease by 0.1 instead of 1, with a minimum of 0.1
                    const newQuantity = item.quantity > 0.1 ? parseFloat((item.quantity - 0.1).toFixed(1)) : 0.1;
                    updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
                    setInputValue(newQuantity.toFixed(1)); // Update local state
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-white"
            >
                <span className="text-sm">−</span>
            </button>

            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="mx-1 px-4 py-1 bg-white border border-gray-300 rounded-full text-center w-16"
                aria-label="Quantity"
            />

            <button
                onClick={() => {
                    // Increase by 0.1 instead of 1
                    const newQuantity = parseFloat((item.quantity + 0.1).toFixed(1));
                    updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
                    setInputValue(newQuantity.toFixed(1)); // Update local state
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-white"
            >
                <span className="text-sm">+</span>
            </button>

            <span className="ml-3 font-medium text-sm">
                {item.unit}
            </span>

            <button
                onClick={() => removeItem(item.id, isDishIngredient, dishId)}
                className="ml-6 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded"
            >
                <FiTrash2 size={18} />
            </button>
        </div>
    );
};

export default QuantityControl;