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
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 30;

    useEffect(() => {
        const fetchIngredients = async () => {
            setLoading(true);
            try {
                const response = await ingredientService.getIngredients(currentPage, pageSize);
                console.log("Kết quả API:", response);

                if (response) {
                    setIngredients(response);
                    setFilteredIngredients(response);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error details:", error);
                setError("Có lỗi xảy ra khi tải dữ liệu nguyên liệu. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchIngredients();
    }, [currentPage]);

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
            const matchesSearch =
                (item.vietnameseName && item.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === "Tất cả" || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        setFilteredIngredients(filtered);
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

                    <FeaturedSection ingredients={ingredients} />

                    <IngredientCategories
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {activeCategory === "Tất cả" ? "Tất Cả Nguyên Liệu" : `Nguyên Liệu ${activeCategory}`}
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                                <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : filteredIngredients.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredIngredients.map((ingredient) => (
                                <ProductCard
                                    key={ingredient.id}
                                    id={ingredient.id}
                                    vietnameseName={ingredient.vietnameseName}
                                    name={ingredient.name}
                                    unit={ingredient.unit}
                                    image={ingredient.imageUrl}
                                    category={ingredient.category}
                                />
                            ))}
                        </div>
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