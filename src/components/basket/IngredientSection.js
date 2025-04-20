import React from 'react';
import { FiChevronsUp, FiChevronsDown } from 'react-icons/fi';
import QuantityControl from './QuantityControl';

const IngredientSection = ({
    ingredients, expanded, toggleSection, updateQuantity, removeItem
}) => {
    return (
        <div className="border-b border-gray-100">
            <div className="flex items-center py-3 px-4">
                <h2 className="text-xl font-bold text-gray-900">Nguyên Liệu</h2>
                <button
                    onClick={toggleSection}
                    className="ml-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                    {expanded ? <FiChevronsUp size={20} /> : <FiChevronsDown size={20} />}
                </button>
            </div>

            {expanded && (
                <div className="pt-4 pb-4 px-6">
                    {ingredients.map((item) => (
                        <div key={item.id} className="flex items-center py-3 mb-2 bg-gray-50 rounded-lg">
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
                            <div className="w-[87.5%] flex justify-end items-center pr-3">
                                <QuantityControl
                                    item={item}
                                    updateQuantity={updateQuantity}
                                    removeItem={removeItem}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IngredientSection;