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
    const [totalPages, setTotalPages] = useState(0);
    const [totalDishes, setTotalDishes] = useState(0);
    const [searchPattern, setSearchPattern] = useState('');
    const pageSize = 12;

    // Fetch dishes based on current page and search pattern
    const fetchDishes = async (page, pattern) => {
        setLoading(true);
        try {
            const response = await dishService.getDishes(page, pageSize, pattern);

            // Handle different response formats
            if (response) {
                if (response.content) {
                    // Handle paginated response format
                    setDishes(response.content);
                    setFilteredDishes(response.content);
                    setTotalPages(response.totalPages);
                    setTotalDishes(response.totalElements);
                } else {
                    // Handle array response format
                    setDishes(response);
                    setFilteredDishes(response);

                    // If we don't get pagination info from API, estimate it
                    if (response.length < pageSize) {
                        setTotalPages(currentPage + 1);
                    } else {
                        setTotalPages(currentPage + 2); // At least one more page
                    }
                    setTotalDishes((currentPage + 1) * pageSize + (response.length < pageSize ? 0 : 1));
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Error details:", error);
            setError("Có lỗi xảy ra khi tải dữ liệu món ăn. Vui lòng thử lại sau.");
            setLoading(false);
        }
    };

    // Initial load and when page/search changes
    useEffect(() => {
        fetchDishes(currentPage, searchPattern);
    }, [currentPage, searchPattern]);

    // Handle search from SearchBar component
    const handleSearch = (searchTerm) => {
        if (searchTerm.toLowerCase() !== searchPattern.toLowerCase()) {
            setCurrentPage(0); // Reset to first page on new search
            setSearchPattern(searchTerm);
        }
    };

    // Handle page navigation
    const handlePageChange = (newPage) => {
        window.scrollTo(0, 0);
        setCurrentPage(newPage);
    };

    // Render pagination controls
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 0) {
                endPage = Math.min(4, totalPages - 1);
            } else if (endPage === totalPages - 1) {
                startPage = Math.max(0, totalPages - 5);
            }
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                    {/* First page button */}
                    <button
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded-md ${currentPage === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        «
                    </button>

                    {/* Previous page button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded-md ${currentPage === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        ‹
                    </button>

                    {/* Page numbers */}
                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${currentPage === page
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } border border-gray-300`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    {/* Next page button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages - 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        ›
                    </button>

                    {/* Last page button */}
                    <button
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages - 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        »
                    </button>
                </div>
            </div>
        );
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
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Tất Cả Món Ăn
                        </h2>

                        {!loading && (
                            <div className="text-sm text-gray-600">
                                Hiển thị {filteredDishes.length} món ăn
                                {` (trang ${currentPage + 1}/${totalPages})`}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                                <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : filteredDishes.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredDishes.map((dish) => (
                                    <DishCard
                                        key={dish.id}
                                        id={dish.id}
                                        image={dish.imageUrl || dish.image}
                                        name={dish.vietnameseName || dish.name}
                                        ingredientCount={dish.ingredients?.length || 0}
                                        ingredients={dish.ingredients || []}
                                    />
                                ))}
                            </div>

                            {renderPagination()}
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