import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineLocationMarker } from "react-icons/hi";
import { getIngredientById, images, restaurantsList } from '../assets/assets';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CheckoutCalculation = () => {
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(true);
    const [combinedIngredients, setCombinedIngredients] = useState([]);
    const [suggestedStores, setSuggestedStores] = useState([]);

    useEffect(() => {
        const storedBasket = localStorage.getItem('basketItems');
        if (storedBasket) {
            const parsedBasket = JSON.parse(storedBasket);
            setBasketItems(parsedBasket);
            combineIngredients(parsedBasket);
            setSuggestedStores(restaurantsList);
        }
        setLoading(false);
    }, []);

    const combineIngredients = (basket) => {
        const combined = {};

        if (basket.ingredients && basket.ingredients.length > 0) {
            basket.ingredients.forEach(item => {
                if (!combined[item.id]) {
                    combined[item.id] = {
                        ...item,
                        totalQuantity: item.quantity,
                        unit: item.unit
                    };
                } else {
                    combined[item.id].totalQuantity += item.quantity;
                    combined[item.id].unit = item.unit;
                }
            });
        }

        if (basket.dishes) {
            Object.values(basket.dishes).forEach(dish => {
                if (dish.ingredients && dish.ingredients.length > 0) {
                    const servings = dish.servings || 1;

                    dish.ingredients.forEach(item => {
                        if (!combined[item.id]) {
                            combined[item.id] = {
                                ...item,
                                totalQuantity: item.quantity * servings,
                                unit: item.unit
                            };

                        } else {
                            combined[item.id].totalQuantity += item.quantity * servings;
                            combined[item.id].unit = item.unit
                        }
                    });
                }
            });
        }

        const combinedArray = Object.values(combined).map(item => ({
            ...item,
            totalQuantity: parseFloat(item.totalQuantity.toFixed(1))
        }));

        setCombinedIngredients(combinedArray);
    };

    const handleBackToCart = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full md:w-1/3 px-4 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                <h2 className="text-xl font-medium flex items-center text-white">
                                    <img src={images.cart} className="h-8 w-8 me-2" alt="Cart icon" />
                                    Tổng sản phẩm
                                </h2>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Nguyên Liệu</h3>
                                <div className="space-y-4">
                                    {combinedIngredients.length > 0 ? (
                                        combinedIngredients.map((item) => (
                                            <div key={item.id} className="flex items-center border-b pb-4">
                                                <div className="w-16 h-16 mr-4 flex-shrink-0 bg-gray-50 p-1 rounded">
                                                    <img
                                                        src={item.image || '/api/placeholder/64/64'}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-medium text-gray-800">{item.name}</div>
                                                    <div className="text-gray-600 text-sm mt-1">
                                                        {item.totalQuantity} {item.unit}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Không có nguyên liệu</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 px-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                <h2 className="text-xl font-medium flex items-center text-white">
                                    <HiOutlineLocationMarker className='h-8 w-8 me-2' />
                                    Địa điểm đề xuất
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {suggestedStores.map((store) => (
                                    <div key={store.id} className="border border-gray-200 rounded-lg p-5">
                                        <div className="flex items-start">
                                            <div className="flex-grow">
                                                <div className="flex items-center mb-2">
                                                    <div className="mr-2 w-5 h-5 text-green-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm text-gray-600">{store.address}</span>
                                                </div>

                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-lg font-medium text-green-600">Tổng Giá: {store.totalPrice.toLocaleString()}VND</h3>
                                                    <img src={store.logo} alt={store.name} className="w-16 h-16 object-contain" />
                                                </div>

                                                {store.rating && (
                                                    <div className="mb-2">
                                                        <div className="flex items-center">
                                                            <span className="text-sm mr-2">Rating:</span>
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i} className="text-yellow-400">
                                                                        {i < store.rating ? "★" : "☆"}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {store.match && (
                                                    <div className="flex items-center text-sm">
                                                        <span className="mr-2">Mức độ phù hợp:</span>
                                                        <span className="text-orange-500 font-medium">{store.match}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleBackToCart}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5 mr-2" />
                                Trở về Giỏ Hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CheckoutCalculation;