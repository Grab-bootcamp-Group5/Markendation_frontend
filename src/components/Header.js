import React, { useState, useEffect } from 'react';
import { FiMapPin } from "react-icons/fi";
import { MdOutlineFileDownload } from "react-icons/md";
import { Link } from 'react-router-dom';
import cartIcon from '../assets/images/cart.png';

const Header = ({ basketCount }) => {
    const [itemCount, setItemCount] = useState(0);

    useEffect(() => {
        const getBasketCount = () => {
            const storedBasket = localStorage.getItem('basketItems');
            if (!storedBasket) return 0;

            const basketItems = JSON.parse(storedBasket);

            const ingredientCount = basketItems.ingredients?.reduce((total, item) => total + 1, 0) || 0;

            let dishIngredientCount = 0;
            Object.values(basketItems.dishes || {}).forEach(dish => {
                dishIngredientCount += dish.ingredients.reduce((total, item) => total + 1, 0);
            });

            return ingredientCount + dishIngredientCount;
        };

        if (basketCount !== undefined) {
            setItemCount(basketCount);
        } else {
            setItemCount(getBasketCount());
        }

        const handleBasketUpdate = () => {
            setItemCount(getBasketCount());
        };

        window.addEventListener('basketUpdated', handleBasketUpdate);

        // Clean up
        return () => {
            window.removeEventListener('basketUpdated', handleBasketUpdate);
        };
    }, [basketCount]);

    return (
        <header className="flex justify-between items-center px-12 py-3 bg-white border-b border-gray-100">
            {/* Location */}
            <div className="flex items-center">
                <FiMapPin className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-700 mr-3">Regent Street, A4, A4201, London</span>
                <button className="text-orange-500 font-medium">Change Location</button>
            </div>

            {/* Basket Count */}
            <div className="flex items-center space-x-4">
                <Link to="/basket" className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                    <img src={cartIcon} alt="Cart" className="h-7 w-7 mr-2" />
                    <span className="font-bold mr-1">{itemCount}</span>
                    <span>sản phẩm</span>
                </Link>

                <button className="border border-gray-200 p-2 rounded hover:bg-gray-50 transition-colors">
                    <MdOutlineFileDownload className="h-5 w-5 text-gray-600" />
                </button>
            </div>
        </header>
    );
};

export default Header;