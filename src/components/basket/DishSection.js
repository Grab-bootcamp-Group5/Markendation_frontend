import React, { useState } from 'react';
import { FiChevronsUp, FiChevronsDown } from 'react-icons/fi';
import QuantityControl from './QuantityControl';

const DishSection = ({
    dishes, expandedSections, toggleSection, updateQuantity, removeItem, updateDishServings
}) => {
    return (
        <div>
            <div className="flex items-center py-3 px-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Món ăn</h2>
                <button
                    onClick={() => toggleSection('foodSection')}
                    className="ml-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                    {expandedSections.foodSection ?
                        <FiChevronsUp size={20} /> :
                        <FiChevronsDown size={20} />
                    }
                </button>
            </div>

            {expandedSections.foodSection && (
                <div className="pt-4 pb-4 px-6">
                    {Object.entries(dishes).map(([dishId, dish]) => (
                        <DishItem
                            key={dishId}
                            dishId={dishId}
                            dish={dish}
                            isExpanded={expandedSections.dishes[dishId]}
                            toggleDish={() => toggleSection('dish', dishId)}
                            updateQuantity={updateQuantity}
                            removeItem={removeItem}
                            updateDishServings={updateDishServings}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DishItem = ({
    dishId, dish, isExpanded, toggleDish, updateQuantity, removeItem, updateDishServings
}) => {
    return (
        <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
            <div className="py-3 px-4 flex items-center">
                <h3 className="font-medium text-gray-800">{dish.name}</h3>
                <ServingsControl
                    dishId={dishId}
                    servings={dish.servings || 1}
                    updateDishServings={updateDishServings}
                />
                <button
                    onClick={toggleDish}
                    className="ml-auto bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                    {isExpanded ? <FiChevronsUp size={20} /> : <FiChevronsDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <div className="pt-2 pb-2 px-4 bg-white">
                    {dish.ingredients.map((ingredient) => (
                        <div
                            key={`${dishId}-${ingredient.id}`}
                            className="flex items-center py-3 mb-2 border-b border-gray-100 last:border-b-0"
                        >
                            <div className="w-[12.5%] px-3">
                                <div className="bg-white p-2 rounded-md shadow-sm flex justify-center items-center">
                                    <img
                                        src={ingredient.image}
                                        alt={ingredient.name}
                                        className="max-h-16 max-w-full object-contain"
                                    />
                                </div>
                                <div className="text-center mt-1">
                                    <p className="font-medium text-xs">{ingredient.name}</p>
                                </div>
                            </div>
                            <div className="w-[87.5%] flex justify-end items-center pr-3">
                                <QuantityControl
                                    item={ingredient}
                                    isDishIngredient={true}
                                    dishId={dishId}
                                    updateQuantity={updateQuantity}
                                    removeItem={removeItem}
                                    dishServings={dish.servings || 1}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ServingsControl = ({ dishId, servings, updateDishServings }) => {
    // State for confirmation dialog
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleDecreaseServings = () => {
        if (servings === 1) {
            // Show confirmation dialog instead of directly decreasing
            setShowConfirmation(true);
        } else {
            // Normal decrease for values > 1
            updateDishServings(dishId, servings - 1);
        }
    };

    const confirmDelete = () => {
        // Confirmed delete - update to 0 which will remove the dish
        updateDishServings(dishId, 0);
        setShowConfirmation(false);
    };

    const cancelDelete = () => {
        // Cancel the delete operation
        setShowConfirmation(false);
    };

    return (
        <div className="flex items-center ml-2 bg-orange-50 rounded-xl border border-orange-200 px-2 py-1">
            <span className="text-xs text-gray-500 mr-1">Phần ăn:</span>
            <button
                onClick={handleDecreaseServings}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-orange-500 text-white mr-1"
            >
                <span className="text-xs">−</span>
            </button>
            <span className="text-sm font-medium mx-1">{servings}</span>
            <button
                onClick={() => {
                    const newServings = servings + 1;
                    updateDishServings(dishId, newServings);
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-orange-500 text-white ml-1"
            >
                <span className="text-xs">+</span>
            </button>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa món ăn này khỏi giỏ hàng?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DishSection;