import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiChevronRight, FiChevronLeft, FiX, FiCamera, FiMessageSquare } from 'react-icons/fi';
import ProductCard from '../components/ingredients/ProductCard';
import DishCard from '../components/DishCard';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import cartIcon from '../assets/images/cart.png';
import { useModal } from '../context/ModalContext';
import { ingredientService } from '../services/ingredientService';
import { dishService } from '../services/dishService';
import { restaurantsList } from '../assets/assets';
import { toast } from 'react-toastify';
import { aiService } from '../services/aiService';

const HomePage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [dishes, setDishes] = useState([]);
    const restaurants = restaurantsList;
    const [loadingIngredients, setLoadingIngredients] = useState(true);
    const [loadingDishes, setLoadingDishes] = useState(true);
    const [errorIngredients, setErrorIngredients] = useState(null);
    const [errorDishes, setErrorDishes] = useState(null);
    const { openModal } = useModal();

    const ingredientsRef = useRef(null);
    const dishesRef = useRef(null);

    const [ingredientsScroll, setIngredientsScroll] = useState({ left: false, right: true });
    const [dishesScroll, setDishesScroll] = useState({ left: false, right: true });
    const [searchQuery, setSearchQuery] = useState('');

    // Highlight input
    const searchInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('text'); // 'text' or 'image'

    // Fetch ingredients from API
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                setLoadingIngredients(true);
                const response = await ingredientService.getIngredients(0, 12);

                if (Array.isArray(response)) {
                    setIngredients(response);
                } else {
                    setIngredients([]);
                }
                setLoadingIngredients(false);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
                setErrorIngredients("Không thể tải danh sách nguyên liệu");
                setLoadingIngredients(false);
            }
        };

        fetchIngredients();
    }, []);

    // Fetch dishes from API
    useEffect(() => {
        const fetchDishes = async () => {
            try {
                setLoadingDishes(true);
                const response = await dishService.getDishes(0, 12);

                if (Array.isArray(response)) {
                    setDishes(response);
                } else {
                    setDishes([]);
                }
                setLoadingDishes(false);
            } catch (error) {
                console.error("Error fetching dishes:", error);
                setErrorDishes("Không thể tải danh sách món ăn");
                setLoadingDishes(false);
            }
        };

        fetchDishes();
    }, []);

    const scrollIngredientsLeft = () => {
        if (ingredientsRef.current) {
            ingredientsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const scrollIngredientsRight = () => {
        if (ingredientsRef.current) {
            ingredientsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const scrollDishesLeft = () => {
        if (dishesRef.current) {
            dishesRef.current.scrollBy({ left: -300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const scrollDishesRight = () => {
        if (dishesRef.current) {
            dishesRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const updateScrollButtons = () => {
        if (ingredientsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ingredientsRef.current;
            setIngredientsScroll({
                left: scrollLeft > 0,
                right: scrollLeft < scrollWidth - clientWidth - 10
            });
        }

        if (dishesRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = dishesRef.current;
            setDishesScroll({
                left: scrollLeft > 0,
                right: scrollLeft < scrollWidth - clientWidth - 10
            });
        }
    };

    const handleScroll = (ref, setScrollState) => {
        if (ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ref.current;
            setScrollState({
                left: scrollLeft > 0,
                right: scrollLeft < scrollWidth - clientWidth - 10
            });
        }
    };

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn một file hình ảnh.');
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleResetImage = () => {
        setSelectedImage(null);
        setPreviewUrl('');
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            toast.error('Vui lòng chọn một hình ảnh trước.');
            return;
        }

        setIsUploading(true);

        try {
            const dishResult = await aiService.getDishSuggestionByImage(selectedImage);

            if (dishResult && dishResult.ingredients && dishResult.ingredients.length > 0) {
                openModal('dish', {
                    id: dishResult.id,
                    name: dishResult.name || 'Món ăn đề xuất',
                    vietnameseName: dishResult.vietnameseName || dishResult.name || 'Món ăn đề xuất',
                    image: dishResult.imageUrl || selectedImage ? URL.createObjectURL(selectedImage) : null,
                    ingredients: dishResult.ingredients.map(ingredient => ({
                        id: ingredient.id,
                        name: ingredient.name,
                        vietnameseName: ingredient.vietnameseName || ingredient.name,
                        image: ingredient.imageUrl,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        category: ingredient.category || 'Khác'
                    })),
                    servings: dishResult.servings || 1
                });

                toast.success('Đã nhận diện món ăn thành công!');
            } else {
                toast.warning('Không nhận diện được món ăn.');
            }

            setSelectedImage(null);
            setPreviewUrl('');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Có lỗi xảy ra khi tải lên hình ảnh. Vui lòng thử lại sau.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        let searchInput = '';
        if (searchInputRef.current) {
            searchInput = searchInputRef.current.value.trim();
        }

        if (!searchInput) return;

        setSearchQuery(searchInput);

        const matchedDish = dishes.find(dish =>
            dish.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
            dish.vietnameseName?.toLowerCase().includes(searchInput.toLowerCase())
        );

        if (matchedDish) {
            openModal('dish', matchedDish);
        } else {
            if (ingredients.length > 0) {
                const randomIngredients = [];
                const numIngredients = Math.floor(Math.random() * 3) + 2; // 2-4 random ingredients

                for (let i = 0; i < numIngredients; i++) {
                    const randomIndex = Math.floor(Math.random() * ingredients.length);
                    randomIngredients.push(ingredients[randomIndex]);
                }

                openModal('search', randomIngredients, searchInput);
            } else {
                toast.info('Không tìm thấy kết quả phù hợp.');
            }
        }

        if (searchInputRef.current) {
            searchInputRef.current.value = '';
        }
    };

    const focusSearchInput = () => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
            setActiveTab('text');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            {/* Hero Section with Highlighted Input Methods */}
            <section className="bg-gradient-to-r from-green-600 to-blue-600 py-12 mb-2">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Mua sắm thông minh cùng AI</h1>
                        <p className="text-white text-lg opacity-90">Chỉ cần nói hoặc tải lên ảnh, chúng tôi sẽ giúp bạn chuẩn bị đầy đủ nguyên liệu</p>
                    </div>

                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="flex border-b">
                            <button
                                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all duration-300 ${activeTab === 'text'
                                    ? 'text-green-600 border-b-2 border-green-600 translate-y-[1px]'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('text')}
                            >
                                <FiMessageSquare size={20} className={`transition-transform duration-300 ${activeTab === 'text' ? 'scale-110' : ''}`} />
                                <span>Nhập món muốn nấu</span>
                            </button>
                            <button
                                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all duration-300 ${activeTab === 'image'
                                    ? 'text-green-600 border-b-2 border-green-600 translate-y-[1px]'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => {
                                    setActiveTab('image');
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth'
                                    });
                                }}
                            >
                                <FiCamera size={20} className={`transition-transform duration-300 ${activeTab === 'image' ? 'scale-110' : ''}`} />
                                <span>Tải ảnh lên</span>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className={`transition-all duration-500 ${activeTab === 'text' ? 'opacity-100 transform translate-x-0' : 'opacity-0 absolute -translate-x-full'}`}>
                                {activeTab === 'text' && (
                                    <form onSubmit={handleSearchSubmit} className="relative">
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Hôm nay bạn muốn ăn gì? VD: Tôi muốn ăn phở bò..."
                                            className="w-full py-4 pl-12 pr-32 border border-gray-300 rounded-full text-lg"
                                        />
                                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-6 py-3 rounded-full flex items-center text-base hover:bg-green-700 transition-all"
                                        >
                                            <img src={cartIcon} alt="" className="h-5 w-5 mr-2" />
                                            <span>Đi chợ</span>
                                            <FiChevronRight className="ml-1" />
                                        </button>
                                    </form>
                                )}
                            </div>
                            <div className={`transition-all duration-500 ${activeTab === 'image' ? 'opacity-100 transform translate-x-0' : 'opacity-0 absolute translate-x-full'}`}>
                                {activeTab === 'image' && (
                                    <div className="flex flex-col items-center animate-fade-in">
                                        <div className="w-full flex space-x-4">
                                            <div className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                                                <div className="flex flex-col items-center justify-center min-h-40">
                                                    <input
                                                        type="file"
                                                        id="image-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                    {!previewUrl ? (
                                                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                                            <div className="mb-3 bg-gray-100 p-4 rounded-full animate-pulse">
                                                                <FiCamera className="w-8 h-8 text-gray-500" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-base font-medium text-gray-700 mb-1">Tải ảnh món ăn lên</p>
                                                                <p className="text-xs text-gray-500">Kích thước tối đa 5MB.</p>
                                                            </div>
                                                        </label>
                                                    ) : (
                                                        <div className="relative w-full animate-fade-in">
                                                            <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain" />
                                                            <button
                                                                onClick={handleResetImage}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                                            >
                                                                <FiX />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    className={`bg-green-600 text-white px-6 py-4 rounded-lg flex items-center justify-center text-base hover:bg-green-700 transition-colors ${isUploading || !selectedImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    onClick={handleUpload}
                                                    disabled={isUploading || !selectedImage}
                                                >
                                                    {isUploading ? (
                                                        <span>Đang tải...</span>
                                                    ) : (
                                                        <>
                                                            <img src={cartIcon} alt="" className="h-5 w-5 mr-2" />
                                                            <span>Nhận diện</span>
                                                            <FiChevronRight className="ml-1" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-3 text-center">
                                            Tải ảnh món ăn bạn muốn nấu, AI sẽ nhận diện và gợi ý nguyên liệu cần mua
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-4">
                {/* Featured badges */}
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center">
                        <span className="font-medium">🎯 Dự đoán thông minh</span>
                    </div>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center">
                        <span className="font-medium">📷 Nhận diện hình ảnh</span>
                    </div>
                    <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full flex items-center">
                        <span className="font-medium">🧠 Gợi ý nguyên liệu</span>
                    </div>
                </div>

                {/* Ingredients Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Danh sách thực phẩm</h2>
                    {errorIngredients ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
                            {errorIngredients}
                        </div>
                    ) : loadingIngredients ? (
                        <div className="flex space-x-4 overflow-hidden pb-4 mt-4">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-64 h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                ref={ingredientsRef}
                                className="flex space-x-4 overflow-hidden pb-4"
                                onScroll={() => handleScroll(ingredientsRef, setIngredientsScroll)}
                            >
                                {ingredients.map((ingredient) => (
                                    <div key={ingredient.id || ingredient.name} className="flex-shrink-0 w-64">
                                        <ProductCard
                                            id={ingredient.id}
                                            vietnameseName={ingredient.vietnameseName}
                                            name={ingredient.name}
                                            unit={ingredient.unit}
                                            image={ingredient.imageUrl || ingredient.image}
                                            category={ingredient.category}
                                        />
                                    </div>
                                ))}
                            </div>

                            {ingredientsScroll.left && (
                                <button
                                    onClick={scrollIngredientsLeft}
                                    className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronLeft className="text-gray-600" />
                                </button>
                            )}

                            {ingredientsScroll.right && (
                                <button
                                    onClick={scrollIngredientsRight}
                                    className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronRight className="text-gray-600" />
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* Dishes Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Danh sách món ăn</h2>
                    {errorDishes ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
                            {errorDishes}
                        </div>
                    ) : loadingDishes ? (
                        <div className="flex space-x-4 overflow-hidden pb-4 mt-4">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-64 h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                ref={dishesRef}
                                className="flex space-x-4 overflow-hidden pb-4"
                                onScroll={() => handleScroll(dishesRef, setDishesScroll)}
                            >
                                {dishes.map((dish) => (
                                    <div key={dish.id || dish.name} className="flex-shrink-0 w-64">
                                        <DishCard
                                            id={dish.id || dish.name}
                                            image={dish.imageUrl || dish.image}
                                            name={dish.vietnameseName || dish.name}
                                            ingredientCount={dish.ingredients?.length || 0}
                                            ingredients={dish.ingredients || []}
                                        />
                                    </div>
                                ))}
                            </div>

                            {dishesScroll.left && (
                                <button
                                    onClick={scrollDishesLeft}
                                    className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronLeft className="text-gray-600" />
                                </button>
                            )}

                            {dishesScroll.right && (
                                <button
                                    onClick={scrollDishesRight}
                                    className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronRight className="text-gray-600" />
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* Call to Action Section */}
                <section className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">Chưa tìm thấy món ăn bạn muốn?</h2>
                        <p className="text-gray-600">Hãy thử sử dụng công cụ tìm kiếm thông minh của chúng tôi</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                        <button
                            onClick={focusSearchInput}
                            className="flex-1 bg-white border border-green-600 text-green-600 px-6 py-3 rounded-lg flex items-center justify-center shadow-sm hover:bg-green-50 transition-colors"
                        >
                            <FiMessageSquare className="mr-2" />
                            <span>Nhập món ăn</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('image')}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center shadow-sm hover:bg-green-700 transition-colors"
                        >
                            <FiCamera className="mr-2" />
                            <span>Tải ảnh lên</span>
                        </button>
                    </div>
                </section>

                {/* Partner Restaurants Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800">Siêu thị, nhà cung cấp liên kết</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {restaurants.map((restaurant) => (
                            <div
                                key={restaurant.id}
                                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                            >
                                {/* Image Container */}
                                <div className="w-full h-40 overflow-hidden bg-gray-50 flex items-center justify-center">
                                    <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                        className="w-32 h-32 object-contain"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium text-gray-800">{restaurant.name}</h3>
                                        <span className="text-xs text-white bg-green-600 px-2 py-1 rounded">Đối tác</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">Siêu thị & nhà cung cấp</div>

                                    {/* Địa chỉ */}
                                    <div className="flex items-center mt-3">
                                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                        <p className="text-xs text-gray-600">{restaurant.address || '1 Nguyễn Hữu Cảnh, Quận 1, TP Hồ Chí Minh'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default HomePage;