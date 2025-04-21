import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const SavedBasketItem = ({ item, type }) => {
    return (
        <div className="flex items-center py-3 mb-2 bg-gray-50 rounded-lg">
            <div className="w-[12.5%] px-3">
                <div className="bg-white p-2 rounded-md shadow-sm flex justify-center items-center">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-16 max-w-full object-contain"
                    />
                </div>
                <div className="text-center mt-1">
                    <p className="font-medium text-xs">{item.name}</p>
                </div>
            </div>
            <div className="w-[75%] flex justify-end items-center pr-3">
                <div className="mx-1 px-6 py-1 bg-white border border-gray-300 rounded-full text-center">
                    {item.quantity} {item.unit}
                </div>
            </div>
            <div className="w-[12.5%] flex justify-center">
                <button className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded">
                    <FiTrash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default SavedBasketItem;