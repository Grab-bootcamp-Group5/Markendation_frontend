import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const SavedBasketItem = ({ item, type, onRemove }) => {
    return (
        <div className="flex items-center py-3 mb-2 bg-gray-50 rounded-lg">
            <div className="flex items-center w-[40%]">
                <div className="bg-white p-2 rounded-md shadow-sm flex justify-center items-center h-24 w-24 ml-4 mr-4">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 object-contain"
                    />
                </div>
                <div>
                    <p className="text-lg font-medium">{item.name}</p>
                </div>
            </div>
            <div className="w-[60%] flex justify-end items-center pr-4">
                <div className="flex items-center">
                    <div className="mx-3 px-4 py-2 bg-white border border-gray-300 rounded-full text-center min-w-[100px]">
                        <span className="font-medium">{item.quantity} {item.unit}</span>
                    </div>

                    {onRemove && (
                        <button
                            onClick={() => onRemove(item.id, type === 'dish-ingredient')}
                            className="ml-6 w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded"
                        >
                            <FiTrash2 size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedBasketItem;