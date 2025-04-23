import React, { useState, useEffect } from 'react';
import { MdOutlineFileDownload } from "react-icons/md";
import { Link } from 'react-router-dom';
import cartIcon from '../assets/images/cart.png';
import LocationSelector from './LocationSelector';

const Header = ({ basketCount }) => {
    const [itemCount, setItemCount] = useState(0);
    const [userLocation, setUserLocation] = useState({
        address: 'Regent Street, A4, A4201, London',
        latitude: 51.5093,
        longitude: -0.1367
    });

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

        // Load saved location from localStorage if available
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            try {
                setUserLocation(JSON.parse(savedLocation));
            } catch (error) {
                console.error('Error parsing saved location:', error);
            }
        }

        window.addEventListener('basketUpdated', handleBasketUpdate);

        // Clean up
        return () => {
            window.removeEventListener('basketUpdated', handleBasketUpdate);
        };
    }, [basketCount]);

    const handleLocationChange = (location) => {
        setUserLocation(location);

        // Save to localStorage
        localStorage.setItem('userLocation', JSON.stringify(location));

        // Send to backend if needed
        sendLocationToBackend(location);
    };

    const sendLocationToBackend = async (location) => {
        try {
            // Example API call to backend
            // In a real app, you would replace this with your actual API endpoint
            // const response = await fetch('https://api.markendation.com/user/location', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(location),
            //     credentials: 'include' // Send cookies if using session authentication
            // });

            // if (!response.ok) {
            //     throw new Error('Failed to update location');
            // }

            // Log for demonstration purposes
            console.log('Location sent to backend:', location);

            // Could dispatch an event here to notify other components that location has changed
            const event = new CustomEvent('locationUpdated', { detail: location });
            window.dispatchEvent(event);

        } catch (error) {
            console.error('Error sending location to backend:', error);
            // Handle error - could show a notification to user
        }
    };

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

                <button className="border border-gray-200 p-2 rounded hover:bg-gray-50 transition-colors">
                    <MdOutlineFileDownload className="h-5 w-5 text-gray-600" />
                </button>
            </div>
        </header>
    );
};

export default Header;