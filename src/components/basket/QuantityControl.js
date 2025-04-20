import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const QuantityControl = ({
    item, isDishIngredient = false, dishId = null, updateQuantity, removeItem, dishServings = 1
}) => {
    // Calculate actual quantity based on whether it's a dish ingredient
    const actualQuantity = isDishIngredient && dishId
        ? item.quantity * (dishServings || 1)
        : item.quantity;

    return (
        <div className="flex items-center">
            <button
                onClick={() => {
                    const newQuantity = item.quantity > 1 ? item.quantity - 1 : 1;
                    updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-white"
            >
                <span className="text-sm">−</span>
            </button>

            <div className="mx-1 px-6 py-1 bg-white border border-gray-300 rounded-full text-center w-16">
                {isDishIngredient ? actualQuantity : item.quantity}
            </div>

            <button
                onClick={() => {
                    updateQuantity(item.id, item.quantity + 1, isDishIngredient, dishId);
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