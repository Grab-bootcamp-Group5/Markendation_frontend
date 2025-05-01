import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineLocationMarker, HiStar, HiChevronDown, HiChevronUp } from "react-icons/hi";
import { images } from '../assets/assets';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

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
    const [expandedStoreId, setExpandedStoreId] = useState(null);
    const [storeDetails, setStoreDetails] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const storedBasket = localStorage.getItem('basketItems');

                if (storedBasket) {
                    const parsedBasket = JSON.parse(storedBasket);
                    setBasketItems(parsedBasket);
                    combineIngredients(parsedBasket);
                }

                const calculationData = location.state?.calculationResult;

                if (calculationData) {
                    console.log("Data received from API:", calculationData);
                    setCalculationResult(calculationData);
                    processCalculationResult(calculationData);
                } else {
                    try {
                        const response = await axios.get('/basket/calculate');
                        const apiData = response.data;
                        setCalculationResult(apiData);
                        processCalculationResult(apiData);
                    } catch (apiError) {
                        console.error("Error fetching calculation data:", apiError);
                        toast.error("Không thể tải dữ liệu tính toán từ server");
                    }
                }
            } catch (error) {
                console.error("Error initializing checkout calculation:", error);
                toast.error("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location.state]);

    const processCalculationResult = (result) => {
        if (!result) {
            toast.error("Dữ liệu tính toán không hợp lệ");
            return;
        }

        const storeData = Array.isArray(result) ? result : [result];

        if (storeData.length === 0) {
            toast.warning("Không tìm thấy cửa hàng phù hợp");
            return;
        }
        console.log('data:', storeData)
        const formattedStores = storeData.map(storeItem => {
            const storeInfo = storeItem.store || {};

            // Process products data
            const products = Array.isArray(storeItem.products)
                ? storeItem.products.map(product => {
                    // Handle different API response structures
                    const productData = product.product || product;

                    // Extract more product details
                    return {
                        id: productData.id || `product-${Math.random().toString(36).substring(2, 9)}`,
                        name: productData.name || "Sản phẩm",
                        name_vi: productData.name_vi || productData.name || "Sản phẩm",
                        name_en: productData.name_ev || productData.name_en || "",
                        image: productData.image || null,
                        price: productData.price || 0,
                        quantity: product.quantity || 1,
                        unit: productData.unit || "cái",
                        cost: product.cost || (productData.price * (product.quantity || 1)) || 0,
                        sku: productData.sku || "",
                        category: productData.category || "Khác",
                        chainStore: productData.store || storeInfo.chain || ""
                    };
                })
                : [];
            // Calculate total cost if not provided
            let totalCost = storeItem.totalCost || 0;
            if (totalCost === 0 && products.length > 0) {
                totalCost = products.reduce((sum, product) => sum + (product.cost || 0), 0);
            }

            // Group products by category for better organization
            const productsByCategory = {};
            products.forEach(product => {
                const category = product.category || "Khác";
                if (!productsByCategory[category]) {
                    productsByCategory[category] = [];
                }
                productsByCategory[category].push(product);
            });

            const distance = storeItem.distance;
            const stars = storeItem.stars;
            const rating = storeItem.rating;

            return {
                id: storeInfo.id || storeItem.id || `store-${Math.random().toString(36).substring(2, 9)}`,
                name: storeInfo.name || storeItem.name || "Cửa hàng",
                address: storeInfo.address || storeItem.address || "Không có địa chỉ",
                phone: storeInfo.phone || storeItem.phone || "",
                logo: storeInfo.logo || storeItem.logo || null,
                rating: rating,
                stars: stars,
                distance: distance,
                totalPrice: totalCost,
                products: products,
                productsByCategory: productsByCategory,
                city: storeInfo.city || "",
                ward: storeInfo.ward || "",
                district: storeInfo.district || "",
                chain: storeInfo.chain || ""
            };
        });
        // Sort stores by rating, then by distance
        formattedStores.sort((a, b) => {
            const ratingA = a.rating || a.stars || 0;
            const ratingB = b.rating || b.stars || 0;

            if (ratingA !== ratingB) {
                return ratingB - ratingA;
            }

            return a.distance - b.distance;
        });

        console.log("Processed store list:", formattedStores);
        setSuggestedStores(formattedStores);
    };

    // Combine ingredients from both individual items and dishes
    const combineIngredients = (basket) => {
        const combined = {};

        // Process individual ingredients
        if (basket.ingredients && basket.ingredients.length > 0) {
            basket.ingredients.forEach(item => {
                if (!combined[item.id]) {
                    combined[item.id] = {
                        ...item,
                        totalQuantity: parseFloat(item.quantity) || 0.1,
                        unit: item.unit || 'g'
                    };
                } else {
                    combined[item.id].totalQuantity += parseFloat(item.quantity) || 0.1;
                }
            });
        }

        // Process ingredients from dishes
        if (basket.dishes) {
            Object.values(basket.dishes).forEach(dish => {
                if (dish.ingredients && dish.ingredients.length > 0) {
                    const servings = parseInt(dish.servings, 10) || 1;

                    dish.ingredients.forEach(item => {
                        if (!combined[item.id]) {
                            combined[item.id] = {
                                ...item,
                                totalQuantity: (parseFloat(item.quantity) || 0.1) * servings,
                                unit: item.unit || 'g'
                            };
                        } else {
                            combined[item.id].totalQuantity += (parseFloat(item.quantity) || 0.1) * servings;
                        }
                    });
                }
            });
        }

        // Convert to array and round quantities
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
        return parseFloat(price).toLocaleString('vi-VN');
    };

    // Toggle store details expansion
    const toggleStoreDetails = (storeId) => {
        setExpandedStoreId(expandedStoreId === storeId ? null : storeId);
    };

    // Get detailed information about a specific store's products
    const getStoreProductDetails = (storeId) => {
        const store = suggestedStores.find(s => s.id === storeId);
        if (!store) return null;

        setStoreDetails({
            ...store,
            isExpanded: true
        });
    };

    // Format product name with Vietnamese and English names if available
    const formatProductName = (product) => {
        if (product.name_vi && product.name_en && product.name_vi !== product.name_en) {
            return (
                <>
                    <div className="font-medium">{product.name_vi}</div>
                    <div className="text-xs text-gray-500 italic">{product.name_en}</div>
                </>
            );
        }
        return <div className="font-medium">{product.name_vi || product.name}</div>;
    };

    // Render star rating
    const renderRating = (rating) => {
        if (!rating && rating !== 0) return null;

        // Round rating to 1 decimal place
        const roundedRating = parseFloat(rating).toFixed(1);

        return (
            <div className="flex items-center mb-2">
                <span className="text-sm mr-2">Đánh giá:</span>
                <span className="font-medium mr-2">{roundedRating}</span>
                <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <HiStar
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Format price with thousand separators
    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(2)}tr`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}k`;
        }
        return value.toString();
    };

    // Render loading state
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
                    {/* Ingredients Summary Panel */}
                    <div className="w-full md:w-1/3 px-4 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                <h2 className="text-xl font-medium flex items-center text-white">
                                    <img src={images.cart} className="h-8 w-8 mr-2" alt="Cart icon" />
                                    Tổng sản phẩm
                                </h2>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Nguyên Liệu</h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {combinedIngredients.length > 0 ? (
                                        combinedIngredients.map((item) => (
                                            <div key={item.id} className="flex items-center border-b pb-4">
                                                <div className="w-16 h-16 mr-4 flex-shrink-0 bg-gray-50 p-1 rounded">
                                                    <img
                                                        src={item.image || item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/default-ingredient.jpg';
                                                        }}
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

                    {/* Suggested Stores Panel */}
                    <div className="w-full md:w-2/3 px-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                <h2 className="text-xl font-medium flex items-center text-white">
                                    <HiOutlineLocationMarker className="h-8 w-8 mr-2" />
                                    Địa điểm đề xuất (Sắp xếp theo đánh giá)
                                </h2>
                            </div>

                            {suggestedStores.length > 0 ? (
                                <div className="space-y-6">
                                    {suggestedStores.map((store) => (
                                        <div key={store.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-grow">
                                                    <h3 className="text-xl font-medium text-gray-800 mb-2">{store.name}</h3>

                                                    <div className="flex items-center mb-2">
                                                        <div className="mr-2 w-5 h-5 text-green-600">
                                                            <HiOutlineLocationMarker className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-sm text-gray-600">{store.address}</span>
                                                    </div>

                                                    {store.phone && (
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            SĐT: {store.phone}
                                                        </div>
                                                    )}

                                                    {/* Rating and distance info */}
                                                    {renderRating(store.rating || store.stars)}

                                                    {store.distance > 0 && (
                                                        <div className="text-sm text-gray-600">
                                                            Khoảng cách: {(store.distance).toFixed(1)}km
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Total price */}
                                            <div className="bg-green-50 p-3 rounded-lg text-lg font-medium text-green-700 mb-4 flex justify-between items-center">
                                                <span>Tổng Giá:</span>
                                                <span className="text-xl">{formatPrice(store.totalPrice)}VND</span>
                                            </div>

                                            {/* Toggle button for store details */}
                                            <button
                                                onClick={() => toggleStoreDetails(store.id)}
                                                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors mb-4"
                                            >
                                                {expandedStoreId === store.id ? (
                                                    <>
                                                        <HiChevronUp className="mr-2" />
                                                        Ẩn chi tiết sản phẩm
                                                    </>
                                                ) : (
                                                    <>
                                                        <HiChevronDown className="mr-2" />
                                                        Xem chi tiết sản phẩm
                                                    </>
                                                )}
                                            </button>

                                            {/* Products list */}
                                            {expandedStoreId === store.id && store.products && store.products.length > 0 && (
                                                <div className="border-t pt-4 mt-2">
                                                    <h4 className="text-lg font-medium mb-4 text-gray-800">Chi tiết sản phẩm có sẵn</h4>

                                                    {/* Products by category */}
                                                    {Object.entries(store.productsByCategory || {}).map(([category, products]) => (
                                                        <div key={category} className="mb-6">
                                                            <h5 className="font-medium text-green-700 mb-3 pb-1 border-b border-green-100">
                                                                {category} ({products.length})
                                                            </h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {products.map((product, index) => (
                                                                    <div key={index} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                                                        <div className="flex items-center mb-2">
                                                                            {product.image && (
                                                                                <div className="w-16 h-16 flex-shrink-0 mr-3 bg-white rounded-md p-1">
                                                                                    <img
                                                                                        src={product.image}
                                                                                        alt={product.name_vi || product.name}
                                                                                        className="w-full h-full object-contain"
                                                                                        onError={(e) => {
                                                                                            e.target.onerror = null;
                                                                                            e.target.src = '/images/default-product.jpg';
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div className="flex-1">
                                                                                {formatProductName(product)}
                                                                                <div className="flex justify-between text-sm mt-1">
                                                                                    <span className="text-green-600 font-medium">{formatPrice(product.cost)}VND</span>
                                                                                    <span className="text-gray-500">{product.quantity} {product.unit}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Product details */}
                                                                        <div className="text-xs text-gray-500 mt-2 pl-2 border-l-2 border-gray-200">
                                                                            {product.sku && (
                                                                                <div className="mb-1">
                                                                                    <span className="font-medium">Mã SKU:</span> {product.sku}
                                                                                </div>
                                                                            )}
                                                                            <div className="mb-1">
                                                                                <span className="font-medium">Đơn giá:</span> {formatPrice(product.price)}VND/{product.unit}
                                                                            </div>
                                                                            <div className="mb-1">
                                                                                <span className="font-medium">Tổng tiền:</span> {formatPrice(product.cost)} VND
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Preview/Summary of products when not expanded */}
                                            {expandedStoreId !== store.id && store.products && store.products.length > 0 && (
                                                <div className="mt-2">
                                                    <h4 className="font-medium text-gray-700 mb-3">Thông tin sản phẩm:</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {store.products.slice(0, 3).map((product, index) => (
                                                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded-lg">
                                                                {product.image && (
                                                                    <div className="w-10 h-10 flex-shrink-0 mr-2 bg-white rounded p-1">
                                                                        <img
                                                                            src={product.image}
                                                                            alt={product.name_vi || product.name}
                                                                            className="w-full h-full object-contain"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                e.target.src = '/images/default-product.jpg';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-xs">{product.name_vi || product.name}</div>
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="text-xs text-green-600">{formatCurrency(product.cost)}đ</div>
                                                                        <div className="text-xs text-gray-500">{product.quantity} {product.unit}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {store.products.length > 3 && (
                                                            <div className="bg-gray-100 p-2 rounded-lg flex items-center justify-center text-sm text-gray-500">
                                                                +{store.products.length - 3} sản phẩm khác
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Không tìm thấy cửa hàng phù hợp</p>
                                    <p className="text-gray-400 text-sm mt-2">Thử thay đổi các nguyên liệu trong giỏ hàng của bạn</p>
                                </div>
                            )}
                        </div>

                        {/* Back to cart button */}
                        <div className="flex justify-center mt-6">
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