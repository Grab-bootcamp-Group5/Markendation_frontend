import React, { useState } from 'react';
import { toast } from 'react-toastify';

const DishCard = ({ id, image, name, ingredientCount, ingredients }) => {
    const [showIngredients, setShowIngredients] = useState(false);

    const addToCart = () => {
        const storedBasket = localStorage.getItem('basketItems');
        let basketItems = storedBasket ? JSON.parse(storedBasket) : {
            ingredients: [],
            dishes: {}
        };

        if (basketItems.dishes[id]) {
            toast.warning(`${name} đã có trong giỏ hàng!`);
            return;
        }

        const formattedIngredients = ingredients.map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            englishName: ingredient.englishName,
            image: ingredient.image,
            quantity: ingredient.quantity,
            unit: ingredient.category === "Dầu ăn" ? "Lít" : "KG",
            category: ingredient.category
        }));

        basketItems.dishes[id] = { id, name, image, ingredients: formattedIngredients };

        localStorage.setItem('basketItems', JSON.stringify(basketItems));

        const event = new CustomEvent('basketUpdated');
        window.dispatchEvent(event);

        toast.success(`Đã thêm ${name} và các nguyên liệu của nó vào giỏ hàng!`);
    };

    return (
        <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Dish image */}
            <div className="relative w-full h-48">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="font-medium text-white text-xl">{name}</h3>
                </div>
            </div>

            {/* Dish info */}
            <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-orange-500 text-sm">{ingredientCount} nguyên liệu</p>
                    <button
                        className="text-blue-600 text-sm font-medium hover:underline"
                        onClick={() => setShowIngredients(!showIngredients)}
                    >
                        {showIngredients ? 'Ẩn nguyên liệu' : 'Xem nguyên liệu'}
                    </button>
                </div>

                {/* Ingredients list (collapsible) */}
                {showIngredients && (
                    <div className="mb-4 pl-3 border-l-2 border-orange-200">
                        <ul className="space-y-2">
                            {ingredients.map((ingredient) => (
                                <li key={ingredient.id} className="flex items-center space-x-2">
                                    <div className="w-8 h-8 flex-shrink-0">
                                        <img
                                            src={ingredient.image}
                                            alt={ingredient.name}
                                            className="w-full h-full object-contain rounded-full"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-700">{ingredient.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Add to cart button */}
                <button
                    className="w-full bg-green-600 text-white py-2 rounded-full font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    onClick={addToCart}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Thêm vào giỏ hàng
                </button>
            </div>
        </div>
    );
};

export default DishCard;