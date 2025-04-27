import React, { useState, useRef } from 'react';
import { FiSearch, FiChevronRight, FiChevronLeft, FiX } from 'react-icons/fi';
import { ingredientsList, dishesList, restaurantsList, getDishWithIngredients } from '../assets/assets';
import ProductCard from '../components/ingredients/ProductCard';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import cartIcon from '../assets/images/cart.png';
import { useModal } from '../context/ModalContext';

const HomePage = () => {
    const ingredients = ingredientsList;
    const dishes = dishesList;
    const restaurants = restaurantsList;
    const { openModal } = useModal();

    const ingredientsRef = useRef(null);
    const dishesRef = useRef(null);

    const [ingredientsScroll, setIngredientsScroll] = useState({ left: false, right: true });
    const [dishesScroll, setDishesScroll] = useState({ left: false, right: true });
    const [searchQuery, setSearchQuery] = useState('');

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

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn một file hình ảnh.');
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleResetImage = () => { setSelectedImage(null); setPreviewUrl(''); };


    const handleUpload = async () => {
        if (!selectedImage) {
            alert('Vui lòng chọn một hình ảnh trước.');
            return;
        }

        setIsUploading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo purposes, just show some random ingredients
            const randomIngredients = [];
            const numIngredients = Math.floor(Math.random() * 3) + 2; // 2-4 random ingredients

            for (let i = 0; i < numIngredients; i++) {
                const randomIndex = Math.floor(Math.random() * ingredients.length);
                randomIngredients.push(ingredients[randomIndex]);
            }

            openModal('ingredients', randomIngredients);

            setSelectedImage(null);
            setPreviewUrl('');

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Có lỗi xảy ra khi tải lên hình ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle text search
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const searchInput = e.target.querySelector('input').value.trim();

        if (!searchInput) return;

        setSearchQuery(searchInput);

        // check if the search matches any dish names
        const matchedDish = dishes.find(dish =>
            dish.name.toLowerCase().includes(searchInput.toLowerCase())
        );

        if (matchedDish) {
            const dishWithIngredients = getDishWithIngredients(matchedDish.id);
            if (dishWithIngredients) {
                openModal('dish', dishWithIngredients);
            }
        } else {
            // Simulate API call
            const randomIngredients = [];
            const numIngredients = Math.floor(Math.random() * 3) + 2; // 2-4 random ingredients

            for (let i = 0; i < numIngredients; i++) {
                const randomIndex = Math.floor(Math.random() * ingredients.length);
                randomIngredients.push(ingredients[randomIndex]);
            }

            openModal('search', randomIngredients, searchInput);
        }

        // Clear search input
        e.target.querySelector('input').value = '';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Ingredients Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Danh sách thực phẩm</h2>
                    <div className="relative">
                        <div
                            ref={ingredientsRef}
                            className="flex space-x-4 overflow-hidden pb-4"
                            onScroll={() => handleScroll(ingredientsRef, setIngredientsScroll)}
                        >
                            {ingredients.map((ingredient) => (
                                <div key={ingredient.id} className="flex-shrink-0 w-64">
                                    <ProductCard
                                        id={ingredient.id}
                                        vietnameseName={ingredient.vietnameseName}
                                        name={ingredient.name}
                                        unit={ingredient.unit}
                                        image={ingredient.image}
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
                </section>

                {/* Dishes Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Danh sách món ăn</h2>
                    <div className="relative">
                        <div
                            ref={dishesRef}
                            className="flex space-x-4 overflow-hidden pb-4"
                            onScroll={() => handleScroll(dishesRef, setDishesScroll)}
                        >
                            {dishes.map((dish) => {
                                const dishWithIngredients = getDishWithIngredients(dish.id);
                                return (
                                    <div key={dish.id} className="flex-shrink-0 w-64">
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => openModal('dish', { id: dish.id, name: dish.name, image: dish.image })}
                                        >
                                            <ProductCard
                                                id={dish.id}
                                                name={dish.name}
                                                image={dish.image}
                                                category={dish.category}
                                                restaurantCount={dish.restaurantCount}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
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
                </section>

                {/* AI Shopping Assistant Section */}
                <section className="mb-8">
                    <h2 className="text-xl font-medium mb-4 flex items-center">
                        Mua sắm nguyên liệu cùng AI
                        <span className="ml-2 text-blue-500">💧</span>
                    </h2>
                    <div className="relative mb-4">
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Hôm nay bạn muốn ăn gì? Hãy để tôi giúp bạn đi chợ nhé!"
                                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-full"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <button
                                type="submit"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-full flex items-center text-sm"
                            >
                                <img src={cartIcon} alt="" className="h-7 w-7 mr-2" />
                                <span>Đi chợ nào</span>
                                <FiChevronRight className="ml-1" />
                            </button>
                        </form>
                    </div>
                </section>

                {/* AI Kitchen Assistant Section */}
                <section className="mb-8">
                    <h2 className="text-xl font-medium mb-4 flex items-center">
                        Nhà giả kim - Biến hình ảnh thành món ăn
                        <span className="ml-2 text-yellow-500">✨</span>
                    </h2>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
                            <div className="flex flex-col items-center justify-center min-h-48">
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {!previewUrl ? (
                                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                        <div className="mb-4">
                                            <svg className="w-12 h-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Browse photo or drop here</p>
                                            <p className="text-xs text-gray-500">A photo larger than 400 pixels work best. Max photo size 5 MB.</p>
                                        </div>
                                    </label>
                                ) : (
                                    <div className="relative w-full">
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
                        <div>
                            <button
                                className={`bg-green-600 text-white px-6 py-4 rounded-lg flex items-center justify-center text-base hover:bg-green-700 transition-colors ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={handleUpload}
                                disabled={isUploading || !selectedImage}
                            >
                                {isUploading ? (
                                    <span>Đang tải...</span>
                                ) : (
                                    <>
                                        <img src={cartIcon} alt="" className="h-7 w-7 mr-2" />
                                        <span>Đi chợ nào</span>
                                        <FiChevronRight className="ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>
                {/* Partner Restaurants Section - Cải thiện phần này */}
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