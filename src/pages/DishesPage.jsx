import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import DishCard from '../components/DishCard';
import { dishService } from '../services/dishService';

const DishesPage = () => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 12;

    // Fetch dishes from API
    const fetchDishes = async (page = 0) => {
        try {
            setLoading(true);
            const response = await dishService.getDishes(page, pageSize);

            if (Array.isArray(response) && response.length > 0) {
                if (page === 0) {
                    setDishes(response);
                    setFilteredDishes(response);
                } else {
                    const newDishes = [...dishes, ...response];
                    setDishes(newDishes);
                    setFilteredDishes(newDishes);
                }

                if (response.length < pageSize) {
                    setHasMore(false);
                }
            } else if (page === 0) {
                setDishes([]);
                setFilteredDishes([]);
                setHasMore(false);
            }

            setLoading(false);
        } catch (err) {
            console.error("Error fetching dishes:", err);
            setError("Có lỗi xảy ra khi tải dữ liệu món ăn. Vui lòng thử lại sau.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes(0);
    }, []);

    const handleSearch = (searchTerm) => {
        if (!searchTerm) {
            setFilteredDishes(dishes);
            return;
        }

        const filtered = dishes.filter(dish => {
            return (dish.vietnameseName && dish.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (dish.name && dish.name.toLowerCase().includes(searchTerm.toLowerCase()));
        });

        setFilteredDishes(filtered);
    };

    const loadMoreDishes = () => {
        if (!loading && hasMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchDishes(nextPage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <SearchBar onSearch={handleSearch} />

                <div className="mt-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Dishes grid */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Danh sách món ăn
                    </h2>

                    {loading && dishes.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((index) => (
                                <div key={index} className="w-full h-80 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : filteredDishes.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {filteredDishes.map((dish) => (
                                    <DishCard
                                        key={dish.id || dish.name}
                                        id={dish.id || dish.name}
                                        image={dish.imageUrl || dish.image}
                                        name={dish.vietnameseName || dish.name}
                                        ingredientCount={dish.ingredients?.length || 0}
                                        ingredients={dish.ingredients || []}
                                    />
                                ))}
                            </div>

                            {/* Load more button */}
                            {hasMore && !error && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={loadMoreDishes}
                                        className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-full transition duration-300"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tải...
                                            </span>
                                        ) : (
                                            "Xem thêm món ăn"
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Không tìm thấy món ăn phù hợp</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DishesPage;