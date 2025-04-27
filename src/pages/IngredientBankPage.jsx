import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ingredients/ProductCard';
import Footer from '../components/Footer';
import IngredientCategories from '../components/ingredients/IngredientCategories';
import FeaturedSection from '../components/ingredients/FeaturedSection';
import { ingredientService } from '../services/ingredientService';

const IngredientBankPage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 30;

    // Fetch ingredients from API
    useEffect(() => {
        const fetchIngredients = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await ingredientService.getIngredients(currentPage, pageSize);

                // Map the response to match the format needed by the components
                // Based on the provided API specification
                const mappedData = data.map(ingredient => ({
                    id: ingredient.id,
                    name: ingredient.name,
                    unit: ingredient.unit,
                    image: ingredient.imageURL || '/images/default-ingredient.jpg',
                    category: ingredient.category || 'Khác', // Default category if not provided
                    restaurantCount: 5 // Default count since not provided by API
                }));

                setIngredients(prevIngredients =>
                    currentPage === 1 ? mappedData : [...prevIngredients, ...mappedData]
                );

                if (currentPage === 1) {
                    setFilteredIngredients(mappedData);
                } else {
                    setFilteredIngredients(prevFiltered => {
                        // Apply current category filter to new data
                        const newFilteredData = activeCategory === "Tất cả" ?
                            mappedData :
                            mappedData.filter(item => item.category === activeCategory);

                        return [...prevFiltered, ...newFilteredData];
                    });
                }

                // Assuming we have at least one page, we'll set more pages if we get data
                setTotalPages(data.length > 0 ? Math.max(totalPages, currentPage + 1) : currentPage);

            } catch (error) {
                console.error("Error loading ingredients:", error);
                setError("Có lỗi xảy ra khi tải dữ liệu nguyên liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchIngredients();
    }, [currentPage]);

    // Filter ingredients when category changes
    useEffect(() => {
        if (activeCategory === "Tất cả") {
            setFilteredIngredients(ingredients);
        } else {
            const filtered = ingredients.filter(item => item.category === activeCategory);
            setFilteredIngredients(filtered);
        }
    }, [activeCategory, ingredients]);

    const handleSearch = (searchTerm) => {
        if (!searchTerm) {
            if (activeCategory === "Tất cả") {
                setFilteredIngredients(ingredients);
            } else {
                const filtered = ingredients.filter(item => item.category === activeCategory);
                setFilteredIngredients(filtered);
            }
            return;
        }

        const filtered = ingredients.filter(item => {
            const matchesSearch = item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "Tất cả" || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        setFilteredIngredients(filtered);
    };

    const loadMoreIngredients = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
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

                    <FeaturedSection ingredients={ingredients.slice(0, 4)} />

                    <IngredientCategories
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {activeCategory === "Tất cả" ? "Tất Cả Nguyên Liệu" : `Nguyên Liệu ${activeCategory}`}
                    </h2>

                    {loading && currentPage === 1 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                                <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : filteredIngredients.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredIngredients.map((ingredient) => (
                                    <ProductCard
                                        key={ingredient.id}
                                        id={ingredient.id}
                                        image={ingredient.image}
                                        name={ingredient.name}
                                        category={ingredient.category}
                                        restaurantCount={ingredient.restaurantCount}
                                        unit={ingredient.unit}
                                    />
                                ))}
                            </div>

                            {currentPage < totalPages && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={loadMoreIngredients}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang tải...' : 'Xem thêm nguyên liệu'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Không tìm thấy nguyên liệu phù hợp</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default IngredientBankPage;