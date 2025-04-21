import React from 'react';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';

const BasketActions = ({ onLoadToCart, onDelete }) => {
    return (
        <div className="py-4 flex justify-center gap-4 border-t border-gray-200 mt-4">
            <button
                onClick={onLoadToCart}
                className="bg-green-600 text-white px-6 py-2 flex items-center justify-center rounded-md"
            >
                <FiShoppingCart className="w-5 h-5 mr-2" />
                Xóa khỏi Giỏ hàng đã lưu
            </button>

            <button
                onClick={onDelete}
                className="bg-red-500 text-white px-6 py-2 flex items-center justify-center rounded-md"
            >
                <FiTrash2 className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
            </button>
        </div>
    );
};

export default BasketActions;