import React from 'react';
import { toast } from 'react-toastify';

const ProductCard = ({ image, name, restaurantCount, id, englishName, category }) => {
    const addToCart = () => {
        const storedBasket = localStorage.getItem('basketItems');
        let basketItems = storedBasket ? JSON.parse(storedBasket) : {
            ingredients: [],
            dishes: {}
        };

        const existingItemIndex = basketItems.ingredients.findIndex(item => item.id === id);

        if (existingItemIndex !== -1) {
            basketItems.ingredients[existingItemIndex].quantity += 1;
        } else {
            basketItems.ingredients.push({
                id,
                name,
                englishName,
                image,
                category,
                quantity: 1,
                unit: category === "Dầu ăn" ? "Lít" : "KG"
            });
        }

        localStorage.setItem('basketItems', JSON.stringify(basketItems));

        const event = new CustomEvent('basketUpdated');
        window.dispatchEvent(event);
        toast.success(`Đã thêm ${englishName} vào giỏ hàng!`)
    };

    return (
        <div className="w-full max-w-xs bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Phần hình ảnh sản phẩm */}
            <div className="w-full p-4 flex justify-center">
                <img
                    src={image}
                    alt={name}
                    className="w-full object-contain h-48"
                />
            </div>

            {/* Phần thông tin và nút thêm */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div>
                    <h3 className="font-medium text-gray-900 text-lg">{name}</h3>
                    <p className="text-orange-500 text-sm">{restaurantCount} Restaurants</p>
                </div>
                <button
                    className="bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-colors"
                    onClick={addToCart}
                    aria-label="Add to cart"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;