import React, { useState, useEffect } from 'react';
import { MdOutlineFileDownload } from "react-icons/md";
import { Link } from 'react-router-dom';
import cartIcon from '../assets/images/cart.png';
import LocationSelector from './LocationSelector';
import { useBasket } from '../context/BasketContext';
import { toast } from 'react-toastify';

const Header = ({ basketCount }) => {
    const [itemCount, setItemCount] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    // Sử dụng BasketContext để cập nhật giỏ hàng
    const { updateBasket, basketItems } = useBasket();

    useEffect(() => {
        // Load initial basket count
        const getBasketCount = () => {
            const storedBasket = localStorage.getItem('basketItems');
            if (!storedBasket) return 0;

            try {
                const basketItems = JSON.parse(storedBasket);

                const ingredientCount = basketItems.ingredients?.reduce((total, item) => total + 1, 0) || 0;

                let dishIngredientCount = 0;
                Object.values(basketItems.dishes || {}).forEach(dish => {
                    dishIngredientCount += dish.ingredients.reduce((total, item) => total + 1, 0);
                });

                return ingredientCount + dishIngredientCount;
            } catch (error) {
                console.error('Error parsing basket items:', error);
                return 0;
            }
        };

        if (basketCount !== undefined) {
            setItemCount(basketCount);
        } else {
            setItemCount(getBasketCount());
        }

        // Load saved location from localStorage if available
        const loadSavedLocation = () => {
            try {
                const savedLocation = localStorage.getItem('userLocation');
                if (savedLocation) {
                    const parsedLocation = JSON.parse(savedLocation);
                    if (parsedLocation && parsedLocation.address) {
                        setUserLocation(parsedLocation);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading saved location:', error);
            }

            // Default location as fallback
            setUserLocation({
                address: 'Regent Street, A4, A4201, London',
                latitude: 51.5093,
                longitude: -0.1367
            });
        };

        loadSavedLocation();

        // Set up event listeners
        const handleBasketUpdate = () => {
            setItemCount(getBasketCount());
        };

        const handleLocationUpdate = (event) => {
            if (event.detail) {
                setUserLocation(event.detail);
            }
        };

        window.addEventListener('basketUpdated', handleBasketUpdate);
        window.addEventListener('locationUpdated', handleLocationUpdate);

        // Clean up
        return () => {
            window.removeEventListener('basketUpdated', handleBasketUpdate);
            window.removeEventListener('locationUpdated', handleLocationUpdate);
        };
    }, [basketCount]);

    const handleLocationChange = (location) => {
        if (!location) return;
        setUserLocation(location);
    };

    // Hàm xử lý cập nhật giỏ hàng lên server
    const handleUpdateBasket = async () => {
        try {
            const result = await updateBasket();
            if (result) {
                toast.success("Đã cập nhật giỏ hàng thành công!");
            } else {
                toast.error("Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Error updating basket:", error);
            toast.error("Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    if (!userLocation) {
        return <div className="flex justify-center items-center px-12 py-3 bg-white border-b border-gray-100">Loading...</div>;
    }

    return (
        <header className="flex justify-between items-center px-12 py-3 bg-white border-b border-gray-100">
            {/* Location Selector Component */}
            <LocationSelector
                onLocationChange={handleLocationChange}
                initialLocation={userLocation}
            />

            {/* Basket Count */}
            <div className="flex items-center space-x-4">
                <Link to="/basket" className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                    <img src={cartIcon} alt="Cart" className="h-7 w-7 mr-2" />
                    <span className="font-bold mr-1">{itemCount}</span>
                    <span>sản phẩm</span>
                </Link>

                <button
                    onClick={handleUpdateBasket}
                    className="border border-gray-200 p-2 rounded hover:bg-gray-50 transition-colors"
                    title="Cập nhật giỏ hàng"
                >
                    <MdOutlineFileDownload className="h-5 w-5 text-gray-600" />
                </button>
            </div>
        </header>
    );
};

export default Header;