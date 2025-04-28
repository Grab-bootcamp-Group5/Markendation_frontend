import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineLocationMarker } from "react-icons/hi";
import { getIngredientById, images, restaurantsList } from '../assets/assets';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const CheckoutCalculation = () => {
    const location = useLocation();
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(true);
    const [combinedIngredients, setCombinedIngredients] = useState([]);
    const [suggestedStores, setSuggestedStores] = useState([]);
    const [calculationResult, setCalculationResult] = useState(null);

    useEffect(() => {
        // Lấy dữ liệu từ localStorage
        const storedBasket = localStorage.getItem('basketItems');

        // Lấy kết quả tính toán từ navigation state (nếu có)
        const calculationData = location.state?.calculationResult;

        if (calculationData) {
            console.log("Dữ liệu nhận được từ API:", calculationData);
            setCalculationResult(calculationData);
            processCalculationResult(calculationData);
        }

        if (storedBasket) {
            const parsedBasket = JSON.parse(storedBasket);
            setBasketItems(parsedBasket);
            combineIngredients(parsedBasket);

            // Chỉ sử dụng dữ liệu cố định nếu không có kết quả tính toán
            if (!calculationData) {
                // Sắp xếp cửa hàng mặc định theo rating
                const sortedRestaurants = [...restaurantsList].sort((a, b) => {
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    return ratingB - ratingA;
                });
                setSuggestedStores(sortedRestaurants);
            }
        }

        setLoading(false);
    }, [location.state]);

    // Xử lý dữ liệu từ API tính toán
    const processCalculationResult = (result) => {
        if (!result || !Array.isArray(result)) {
            toast.error("Dữ liệu tính toán không hợp lệ");
            return;
        }

        // Chuyển đổi kết quả API thành định dạng hiển thị
        const formattedStores = result.map(store => {
            // Tính tổng giá
            let totalCost = store.totalCost || 0;
            if (!totalCost && store.products && Array.isArray(store.products)) {
                totalCost = store.products.reduce((sum, product) => {
                    return sum + (product.cost || 0);
                }, 0);
            }

            // Lấy thông tin từ store nếu có
            const storeInfo = store.store || {};

            return {
                id: store.id || storeInfo.id || storeInfo.store_id || `store-${Math.random().toString(36).substr(2, 9)}`,
                name: storeInfo.name || store.name || "Cửa hàng",
                address: storeInfo.address || store.address || "Không có địa chỉ",
                totalPrice: totalCost,
                logo: storeInfo.logo || store.logo || "https://via.placeholder.com/50",
                rating: store.rating || storeInfo.rating || 0,
                stars: store.stars || 0,
                distance: store.distance || 0,
                products: store.products || []
            };
        });

        // Sắp xếp cửa hàng theo rating từ cao xuống thấp
        formattedStores.sort((a, b) => {
            // Ưu tiên sắp xếp theo rating nếu có
            const ratingA = a.rating || a.stars || 0;
            const ratingB = b.rating || b.stars || 0;

            if (ratingA !== ratingB) {
                return ratingB - ratingA;
            }

            // Nếu rating bằng nhau, sắp xếp theo khoảng cách
            return a.distance - b.distance;
        });

        console.log("Danh sách cửa hàng sau khi xử lý:", formattedStores);
        setSuggestedStores(formattedStores);
    };

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

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN');
    };

    // Hiển thị rating dưới dạng số và số sao
    const renderRating = (rating) => {
        if (!rating && rating !== 0) return null;

        // Làm tròn rating đến 1 chữ số thập phân
        const roundedRating = parseFloat(rating).toFixed(1);

        return (
            <div className="mb-2">
                <div className="flex items-center">
                    <span className="text-sm mr-2">Đánh giá:</span>
                    <span className="font-medium mr-2">{roundedRating}</span>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400">
                                {star <= Math.round(rating) ? "★" : "☆"}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
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
                                                        src={item.image || item.imageUrl || '/api/placeholder/64/64'}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-medium text-gray-800">{item.vietnameseName || item.name}</div>
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
                                    Địa điểm đề xuất (Sắp xếp theo đánh giá)
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {suggestedStores.length > 0 ? (
                                    suggestedStores.map((store) => (
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
                                                        <h3 className="text-lg font-medium text-green-600">
                                                            Tổng Giá: {formatPrice(store.totalPrice)}VND
                                                        </h3>
                                                        {store.logo && (
                                                            <img src={store.logo} alt={store.name} className="w-16 h-16 object-contain" />
                                                        )}
                                                    </div>

                                                    {/* Hiển thị đánh giá */}
                                                    {renderRating(store.rating || store.stars)}

                                                    {store.distance > 0 && (
                                                        <div className="mb-2 text-gray-600 text-sm">
                                                            Khoảng cách: {(store.distance / 1000).toFixed(1)}km
                                                        </div>
                                                    )}

                                                    {/* Hiển thị danh sách sản phẩm nếu có */}
                                                    {store.products && store.products.length > 0 && (
                                                        <div className="mt-4 pt-4 border-t">
                                                            <h4 className="font-medium mb-2">Sản phẩm có sẵn:</h4>
                                                            <div className="space-y-3">
                                                                {store.products.map((product, index) => (
                                                                    <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                                                                        {product.image && (
                                                                            <div className="w-12 h-12 flex-shrink-0 mr-3">
                                                                                <img
                                                                                    src={product.image}
                                                                                    alt={product.name_vi || product.name}
                                                                                    className="w-full h-full object-contain"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">{product.name_vi || product.name}</div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <span>{formatPrice(product.cost || 0)}VND</span>
                                                                                <span>{product.quantity || 1} {product.unit}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Không tìm thấy cửa hàng phù hợp</p>
                                    </div>
                                )}
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