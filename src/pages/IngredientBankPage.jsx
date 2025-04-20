import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import IngredientCategories from '../components/IngredientCategories';
import FeaturedSection from '../components/FeaturedSection';

const IngredientBankPage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [filteredIngredients, setFilteredIngredients] = useState([]);

    const ingredientsList = [
        { name: "flour", vietnameseName: "Bột Mì", category: "Bột", restaurantCount: 21 },
        { name: "rice", vietnameseName: "Gạo", category: "Gạo", restaurantCount: 45 },
        { name: "vegetable oil", vietnameseName: "Dầu Ăn", category: "Dầu ăn", restaurantCount: 36 },
        { name: "fish sauce", vietnameseName: "Nước Mắm", category: "Gia vị", restaurantCount: 50 },
        { name: "sugar", vietnameseName: "Đường", category: "Gia vị", restaurantCount: 28 },
        { name: "salt", vietnameseName: "Muối", category: "Gia vị", restaurantCount: 42 },
        { name: "chicken broth", vietnameseName: "Hạt Nêm", category: "Gia vị", restaurantCount: 33 },
        { name: "msg", vietnameseName: "Bột Ngọt", category: "Gia vị", restaurantCount: 29 },
        { name: "garlic", vietnameseName: "Tỏi", category: "Rau củ", restaurantCount: 55 },
        { name: "tomato", vietnameseName: "Cà Chua", category: "Rau củ", restaurantCount: 40 },
        { name: "carrot", vietnameseName: "Cà Rốt", category: "Rau củ", restaurantCount: 38 },
        { name: "beef", vietnameseName: "Thịt Bò", category: "Thịt", restaurantCount: 47 },
        { name: "chicken", vietnameseName: "Thịt Gà", category: "Thịt", restaurantCount: 52 },
        { name: "pork", vietnameseName: "Thịt Heo", category: "Thịt", restaurantCount: 49 },
        { name: "shrimp", vietnameseName: "Tôm", category: "Hải sản", restaurantCount: 44 },
        { name: "fish", vietnameseName: "Cá", category: "Hải sản", restaurantCount: 41 }
    ];

    useEffect(() => {
        setTimeout(() => {
            try {
                const data = ingredientsList.map((ingredient, index) => ({
                    id: index + 1,
                    name: ingredient.vietnameseName,
                    englishName: ingredient.name,
                    image: getPlaceholderImage(ingredient.category, ingredient.vietnameseName),
                    restaurantCount: ingredient.restaurantCount,
                    category: ingredient.category
                }));

                setIngredients(data);
                setFilteredIngredients(data);
                setLoading(false);
            } catch (error) {
                console.error("Error loading ingredients:", error);
                setError("Có lỗi xảy ra khi tải dữ liệu nguyên liệu. Vui lòng thử lại sau.");
                setLoading(false);
            }
        }, 800);
    }, []);

    const getPlaceholderImage = (category, name) => {
        const categoryColors = {
            "Bột": "E3C4A8",
            "Gạo": "F5F5DC",
            "Dầu ăn": "FFD700",
            "Gia vị": "FF6347",
            "Rau củ": "228B22",
            "Thịt": "CD5C5C",
            "Hải sản": "4682B4",
            "Trứng sữa": "FFFACD"
        };

        const color = categoryColors[category] || "CCCCCC";

        const encodedName = encodeURIComponent(name);

        return `https://placehold.co/600x500/${color}/FFFFFF?text=${encodedName}`;
    };

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
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.englishName && item.englishName.toLowerCase().includes(searchTerm.toLowerCase()));
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
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                                <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : filteredIngredients.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredIngredients.map((ingredient) => (
                                <ProductCard
                                    key={ingredient.id}
                                    image={ingredient.image}
                                    name={ingredient.name}
                                    restaurantCount={ingredient.restaurantCount}
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