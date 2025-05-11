import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineLocationMarker, HiStar, HiChevronDown, HiChevronUp, HiSwitchHorizontal, HiCheck } from "react-icons/hi";
import { images } from '../assets/assets';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import SimilarProductsModal from '../components/SimilarProductsModal';

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
    const [activeCategoryTab, setActiveCategoryTab] = useState({});
    const [storeDetails, setStoreDetails] = useState({});
    const [selectedProducts, setSelectedProducts] = useState({});

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentStore, setCurrentStore] = useState(null);
    const [similarProductsForModal, setSimilarProductsForModal] = useState([]);

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

        const formattedStores = storeData.map(storeItem => {
            const storeInfo = storeItem.store || {};

            // Process main products
            const products = Array.isArray(storeItem.products)
                ? storeItem.products.map(product => {
                    const productData = product.product;
                    console.log('product', productData.unit)
                    return {
                        id: productData.id || `product-${Math.random().toString(36).substring(2, 9)}`,
                        name: productData.name || "Sản phẩm",
                        name_vi: productData.name_vi || productData.name || "Sản phẩm",
                        name_en: productData.name_ev || productData.name_en || "",
                        image: productData.image || null,
                        price: productData.price || 0,
                        quantity: product.quantity || 1,
                        unit: productData.unit,
                        cost: product.cost || (productData.price * (product.quantity || 1)) || 0,
                        sku: productData.sku || "",
                        category: productData.category || "Khác",
                        chainStore: productData.store || storeInfo.chain || "",
                        productIndex: product.productIndex || 0
                    };
                })
                : [];

            // Process similar products
            const similarProducts = Array.isArray(storeItem.similarProducts)
                ? storeItem.similarProducts.map(product => {
                    const productData = product.product || product;

                    return {
                        id: productData.id || `similar-${Math.random().toString(36).substring(2, 9)}`,
                        name: productData.name || "Sản phẩm tương tự",
                        name_vi: productData.name_vi || productData.name || "Sản phẩm tương tự",
                        name_en: productData.name_ev || productData.name_en || "",
                        image: productData.image || null,
                        price: productData.price || 0,
                        quantity: product.quantity || 1,
                        unit: productData.unit,
                        cost: product.cost || (productData.price * (product.quantity || 1)) || 0,
                        sku: productData.sku || "",
                        category: productData.category || "Khác",
                        chainStore: productData.store || storeInfo.chain || "",
                        productIndex: product.productIndex || 0
                    };
                })
                : [];

            // Group similar products by productIndex for easier access
            const similarProductsByIndex = {};
            similarProducts.forEach(product => {
                if (!similarProductsByIndex[product.productIndex]) {
                    similarProductsByIndex[product.productIndex] = [];
                }
                similarProductsByIndex[product.productIndex].push(product);
            });

            // Process lackIngredients data
            const lackIngredients = Array.isArray(storeItem.lackIngredients)
                ? storeItem.lackIngredients.map(ingredient => ({
                    id: ingredient.id || `ingredient-${Math.random().toString(36).substring(2, 9)}`,
                    vietnameseName: ingredient.vietnameseName || "",
                    name: ingredient.name || "Nguyên liệu",
                    image: ingredient.image || null,
                    quantity: ingredient.quantity || 0,
                    unit: ingredient.unit,
                    category: ingredient.category || "Khác"
                }))
                : [];

            let totalCost = storeItem.totalCost || 0;
            if (totalCost === 0 && products.length > 0) {
                totalCost = products.reduce((sum, product) => sum + (product.cost || 0), 0);
            }

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
                similarProducts: similarProducts,
                similarProductsByIndex: similarProductsByIndex,
                productsByCategory: productsByCategory,
                lackIngredients: lackIngredients,
                city: storeInfo.city || "",
                ward: storeInfo.ward || "",
                district: storeInfo.district || "",
                chain: storeInfo.chain || ""
            };
        });

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

        // Initialize the active category tab for each store
        const initialActiveTabs = {};
        formattedStores.forEach(store => {
            if (store.productsByCategory && Object.keys(store.productsByCategory).length > 0) {
                initialActiveTabs[store.id] = Object.keys(store.productsByCategory)[0];
            }
        });
        setActiveCategoryTab(initialActiveTabs);
    };

    const combineIngredients = (basket) => {
        const combined = {};

        if (basket.ingredients && basket.ingredients.length > 0) {
            basket.ingredients.forEach(item => {
                if (!combined[item.id]) {
                    combined[item.id] = {
                        ...item,
                        totalQuantity: parseFloat(item.quantity) || 0.1,
                        unit: item.unit
                    };
                } else {
                    combined[item.id].totalQuantity += parseFloat(item.quantity) || 0.1;
                }
            });
        }

        if (basket.dishes) {
            Object.values(basket.dishes).forEach(dish => {
                if (dish.ingredients && dish.ingredients.length > 0) {
                    const servings = parseInt(dish.servings, 10) || 1;

                    dish.ingredients.forEach(item => {
                        if (!combined[item.id]) {
                            combined[item.id] = {
                                ...item,
                                totalQuantity: (parseFloat(item.quantity) || 0.1) * servings,
                                unit: item.unit
                            };
                        } else {
                            combined[item.id].totalQuantity += (parseFloat(item.quantity) || 0.1) * servings;
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
        return parseFloat(price).toLocaleString('vi-VN');
    };

    const toggleStoreDetails = (storeId) => {
        setExpandedStoreId(expandedStoreId === storeId ? null : storeId);
    };

    const selectCategoryTab = (storeId, category) => {
        setActiveCategoryTab({
            ...activeCategoryTab,
            [storeId]: category
        });
    };

    const handleProductSelect = (storeId, productId, similarProductId) => {
        // Find the store and the product to swap
        const store = suggestedStores.find(s => s.id === storeId);
        if (!store) return;

        const product = store.products.find(p => p.id === productId);
        if (!product) return;

        const similarProduct = store.similarProducts.find(p => p.id === similarProductId);
        if (!similarProduct) return;

        // Update the selected products object
        setSelectedProducts({
            ...selectedProducts,
            [`${storeId}-${productId}`]: similarProductId
        });

        // Clone the suggested stores array
        const updatedStores = [...suggestedStores];
        const storeIndex = updatedStores.findIndex(s => s.id === storeId);

        // Update the product in the store
        const productIndex = updatedStores[storeIndex].products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            // Keep the original product ID for reference
            const updatedProduct = {
                ...similarProduct,
                originalProductId: productId,
                isAlternative: true
            };

            updatedStores[storeIndex].products[productIndex] = updatedProduct;

            // Update in product category too
            const category = product.category || "Khác";
            if (updatedStores[storeIndex].productsByCategory[category]) {
                const catProductIndex = updatedStores[storeIndex].productsByCategory[category].findIndex(p => p.id === productId);
                if (catProductIndex !== -1) {
                    updatedStores[storeIndex].productsByCategory[category][catProductIndex] = updatedProduct;
                }
            }

            // Recalculate total price
            updatedStores[storeIndex].totalPrice = updatedStores[storeIndex].products.reduce(
                (total, p) => total + (p.cost || 0),
                0
            );

            // Update the stores
            setSuggestedStores(updatedStores);
            toast.success("Đã thay đổi sản phẩm thành công!");
        }
    };

    // Handle opening modal to show similar products
    const openSimilarProductsModal = (product, store) => {
        const similarProducts = store.similarProductsByIndex[product.productIndex] || [];
        if (similarProducts.length === 0) {
            toast.info("Không có sản phẩm thay thế cho sản phẩm này");
            return;
        }

        setCurrentProduct(product);
        setCurrentStore(store);
        setSimilarProductsForModal(similarProducts);
        setModalOpen(true);
    };

    // Handle product swap from modal
    const handleProductSwapFromModal = (originalProduct, newProduct) => {
        if (!currentStore || !originalProduct || !newProduct) return;

        handleProductSelect(currentStore.id, originalProduct.id, newProduct.id);
        setModalOpen(false);
    };

    const formatProductName = (product) => {
        if (product.name_vi && product.name_en && product.name_vi !== product.name_en) {
            return (
                <>
                    <div className="text-sm font-medium">{product.name_vi}</div>
                    <div className="text-xs text-gray-500 italic">{product.name_en}</div>
                </>
            );
        }
        return <div className="font-medium">{product.name_vi || product.name}</div>;
    };

    const renderRating = (rating) => {
        if (!rating && rating !== 0) return null;

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

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(2)}tr`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}k`;
        }
        return value.toString();
    };

    // Compact product card with dropdown for similar products
    const renderCompactProduct = (product, store) => {
        const similarProducts = store.similarProductsByIndex[product.productIndex] || [];
        const hasSimilarProducts = similarProducts && similarProducts.length > 0;
        const isSelected = selectedProducts[`${store.id}-${product.id}`];

        // If it's a swapped product, show it differently
        const isAlternative = product.isAlternative === true;

        return (
            <div className={`${isAlternative ? 'bg-orange-50' : 'bg-white'} rounded-lg border border-gray-200 p-3 mb-3`}>
                <div className="flex mb-2">
                    {/* Product image */}
                    <div className="w-16 h-16 flex-shrink-0 mr-3">
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

                    {/* Product name and price */}
                    <div className="flex-1">
                        {formatProductName(product)}
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-green-600 font-medium">{formatPrice(product.cost)}VND</span>
                            <span className="text-gray-500">{product.quantity} x {product.unit}</span>
                        </div>
                    </div>

                    {/* Similar products button */}
                    {hasSimilarProducts && (
                        <div className="ml-2">
                            <button
                                onClick={() => openSimilarProductsModal(product, store)}
                                className={`p-1.5 rounded-full ${isAlternative ? 'bg-orange-100 text-orange-600' : 'bg-green-600 text-white'} hover:bg-green-200`}
                                title="Xem sản phẩm tương tự"
                            >
                                <HiSwitchHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    )}
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
        );
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
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
                                        <div key={store.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Store header - Always visible */}
                                            <div className="bg-gray-50 p-4">
                                                <div className="flex items-start justify-between mb-2">
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

                                                {/* Total price and preview */}
                                                <div className="mt-3">
                                                    <div className="bg-green-50 p-3 rounded-lg font-medium text-green-700 flex justify-between items-center mb-3">
                                                        <span>Tổng Giá:</span>
                                                        <span className="text-xl">{formatPrice(store.totalPrice)}VND</span>
                                                    </div>

                                                    <button
                                                        onClick={() => toggleStoreDetails(store.id)}
                                                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
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
                                                </div>
                                            </div>

                                            {/* Missing Ingredients Warning Section */}
                                            {store.lackIngredients && store.lackIngredients.length > 0 && (
                                                <div className="mx-4 my-3 border border-yellow-300 bg-yellow-50 rounded-lg p-3">
                                                    <div className="flex items-center mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <h4 className="text-base font-bold text-yellow-700">Nguyên liệu thiếu</h4>
                                                    </div>
                                                    <p className="text-sm text-yellow-700 mb-2">Cửa hàng này không có đủ các nguyên liệu sau:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {store.lackIngredients.map((item, index) => (
                                                            <div key={index} className="flex items-center bg-white p-2 rounded border border-yellow-200">
                                                                {item.image && (
                                                                    <div className="w-16 h-16 flex-shrink-0 mr-2 bg-white rounded-md p-1">
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.vietnameseName || item.name}
                                                                            className="w-full h-full object-contain"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                e.target.src = '/images/default-ingredient.jpg';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-medium text-gray-800">{item.vietnameseName || item.name}</div>
                                                                    <div className="text-xs text-gray-600">
                                                                        <span className="font-medium">{item.quantity}</span> {item.unit}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Expanded details - Only visible when expanded */}
                                            {expandedStoreId === store.id && store.products && store.products.length > 0 && (
                                                <div className="p-4 border-t border-gray-200">
                                                    <h4 className="text-lg font-medium mb-4 text-gray-800">Chi tiết sản phẩm có sẵn</h4>

                                                    {/* Products by category */}
                                                    {Object.entries(store.productsByCategory || {}).map(([category, products]) => (
                                                        <div key={category} className="mb-6">
                                                            <h5 className="font-medium text-green-700 mb-3 pb-1 border-b border-green-100">
                                                                {category} ({products.length})
                                                            </h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {products.map(product =>
                                                                    renderCompactProduct(product, store)
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Preview of products when not expanded */}
                                            {expandedStoreId !== store.id && store.products && store.products.length > 0 && (
                                                <div className="px-4 py-3 border-t border-gray-200">
                                                    <div className="flex flex-wrap gap-2">
                                                        {store.products.slice(0, 3).map((product, index) => (
                                                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                {product.image && (
                                                                    <div className="w-8 h-8 flex-shrink-0 mr-2 bg-white rounded-md p-1">
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
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-xs truncate">{product.name_vi || product.name}</div>
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <div className="text-green-600">{formatCurrency(product.cost)}đ</div>
                                                                        <div className="text-gray-500">{product.quantity} {product.unit}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {store.products.length > 3 && (
                                                            <div className="bg-gray-100 p-2 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                                                +{store.products.length - 3} sản phẩm khác
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Similar products count indicator */}
                                                    {store.similarProducts && store.similarProducts.length > 0 && (
                                                        <div className="flex items-center mt-3 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                                            <HiSwitchHorizontal className="w-4 h-4 text-orange-500 mr-2" />
                                                            <div className="text-xs text-orange-700">
                                                                Có <span className="font-medium">{store.similarProducts.length}</span> sản phẩm thay thế có sẵn
                                                            </div>
                                                        </div>
                                                    )}
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

            {/* Similar Products Modal */}
            <SimilarProductsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                product={currentProduct}
                similarProducts={similarProductsForModal}
                onSelectProduct={handleProductSwapFromModal}
                formatPrice={formatPrice}
            />
        </div>
    );
};

export default CheckoutCalculation;