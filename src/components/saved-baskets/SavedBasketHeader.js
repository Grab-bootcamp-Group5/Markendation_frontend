import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';

const SavedBasketHeader = ({ basketName }) => {
    return (
        <div className="bg-green-600 py-3 px-4 flex justify-between items-center mb-px">
            <div className="flex items-center gap-2">
                <FiShoppingBag className="h-7 w-7 text-white" />
                <h1 className="text-white text-xl font-medium">Giỏ Hàng Đã Lưu</h1>
            </div>
            <div className="text-white font-medium">{basketName}</div>
        </div>
    );
};

export default SavedBasketHeader;