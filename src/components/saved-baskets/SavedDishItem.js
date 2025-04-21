import React, { useState } from 'react';
import { FiChevronsUp, FiChevronsDown, FiTrash2 } from 'react-icons/fi';
import SavedBasketItem from './SavedBasketItem';

const SavedDishItem = ({ dish, onRemoveDish, onRemoveIngredient }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden shadow-sm">
            <div className="py-3 px-4 flex items-center">
                <div className="flex items-center">
                    {dish.image && (
                        <div className="mr-4 h-16 w-16 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                                src={dish.image}
                                alt={dish.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                    <div>
                        <h3 className="font-medium text-lg text-gray-800">{dish.name}</h3>
                        <div className="flex items-center mt-1">
                            <div className="bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                                <span className="text-sm text-gray-600">Phần ăn: <span className="font-medium">{dish.servings}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex ml-auto">
                    {onRemoveDish && (
                        <button
                            onClick={() => onRemoveDish(dish.id)}
                            className="w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded mr-2"
                        >
                            <FiTrash2 size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center"
                    >
                        {isExpanded ? <FiChevronsUp size={24} /> : <FiChevronsDown size={24} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="pt-2 pb-3 px-4 bg-white">
                    {dish.ingredients.map((ingredient) => (
                        <SavedBasketItem
                            key={`${dish.id}-${ingredient.id}`}
                            item={ingredient}
                            type="dish-ingredient"
                            onRemove={onRemoveIngredient ?
                                (id) => onRemoveIngredient(dish.id, id) :
                                undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedDishItem;