import React, { useState } from 'react';
import { FiChevronsUp, FiChevronsDown, FiTrash2 } from 'react-icons/fi';
import SavedBasketItem from './SavedBasketItem';

const SavedDishItem = ({ dish }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
            <div className="py-3 px-4 flex items-center">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-orange-500 font-bold">{dish.servings}</span>
                    </div>
                    <h3 className="font-medium text-gray-800">{dish.name}</h3>
                </div>

                <div className="flex ml-auto">
                    <button className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded mr-2">
                        <FiTrash2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                        {isExpanded ? <FiChevronsUp size={20} /> : <FiChevronsDown size={20} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="pt-2 pb-2 px-4 bg-white">
                    {dish.ingredients.map((ingredient) => (
                        <SavedBasketItem
                            key={`${dish.id}-${ingredient.id}`}
                            item={ingredient}
                            type="dish-ingredient"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedDishItem;