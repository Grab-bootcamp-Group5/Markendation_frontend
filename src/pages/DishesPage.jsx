import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import DishCard from '../components/DishCard';

const DishesPage = () => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [filteredDishes, setFilteredDishes] = useState([]);

    // Mock data for dishes
    const ingredientsList = [
        { id: 1, name: "Bột Mì", englishName: "flour", category: "Bột", image: "https://placehold.co/600x500/E3C4A8/FFFFFF?text=Bột%20Mì" },
        { id: 2, name: "Gạo", englishName: "rice", category: "Gạo", image: "https://placehold.co/600x500/F5F5DC/FFFFFF?text=Gạo" },
        { id: 3, name: "Dầu Ăn", englishName: "vegetable oil", category: "Dầu ăn", image: "https://placehold.co/600x500/FFD700/FFFFFF?text=Dầu%20Ăn" },
        { id: 4, name: "Nước Mắm", englishName: "fish sauce", category: "Gia vị", image: "https://placehold.co/600x500/FF6347/FFFFFF?text=Nước%20Mắm" },
        { id: 5, name: "Thịt Bò", englishName: "beef", category: "Thịt", image: "https://placehold.co/600x500/CD5C5C/FFFFFF?text=Thịt%20Bò" },
        { id: 6, name: "Thịt Gà", englishName: "chicken", category: "Thịt", image: "https://placehold.co/600x500/CD5C5C/FFFFFF?text=Thịt%20Gà" },
        { id: 7, name: "Tỏi", englishName: "garlic", category: "Rau củ", image: "https://placehold.co/600x500/228B22/FFFFFF?text=Tỏi" },
        { id: 8, name: "Cà Chua", englishName: "tomato", category: "Rau củ", image: "https://placehold.co/600x500/228B22/FFFFFF?text=Cà%20Chua" },
        { id: 9, name: "Muối", englishName: "salt", category: "Gia vị", image: "https://placehold.co/600x500/FF6347/FFFFFF?text=Muối" },
        { id: 10, name: "Hạt Nêm", englishName: "chicken broth", category: "Gia vị", image: "https://placehold.co/600x500/FF6347/FFFFFF?text=Hạt%20Nêm" }
    ];

    const dishesList = [
        {
            id: 1,
            name: "Phở Bò",
            englishName: "Beef Pho",
            category: "Món Việt",
            image: "https://placehold.co/600x400/8B4513/FFFFFF?text=Phở%20Bò",
            ingredientIds: [2, 5, 7, 9, 10]
        },
        {
            id: 2,
            name: "Cơm Gà",
            englishName: "Chicken Rice",
            category: "Món Việt",
            image: "https://placehold.co/600x400/DAA520/FFFFFF?text=Cơm%20Gà",
            ingredientIds: [2, 6, 7, 9, 10]
        },
        {
            id: 3,
            name: "Pizza Gà",
            englishName: "Chicken Pizza",
            category: "Món Ý",
            image: "https://placehold.co/600x400/B22222/FFFFFF?text=Pizza%20Gà",
            ingredientIds: [1, 3, 6, 7, 8, 9]
        },
        {
            id: 4,
            name: "Mì Ý Bò Bằm",
            englishName: "Beef Spaghetti",
            category: "Món Ý",
            image: "https://placehold.co/600x400/8B0000/FFFFFF?text=Mì%20Ý%20Bò%20Bằm",
            ingredientIds: [1, 3, 5, 7, 8, 9]
        },
        {
            id: 5,
            name: "Gà Rán",
            englishName: "Fried Chicken",
            category: "Món Âu",
            image: "https://placehold.co/600x400/D2691E/FFFFFF?text=Gà%20Rán",
            ingredientIds: [1, 3, 6, 9, 10]
        },
        {
            id: 6,
            name: "Bò Kho",
            englishName: "Beef Stew",
            category: "Món Việt",
            image: "https://placehold.co/600x400/8B4513/FFFFFF?text=Bò%20Kho",
            ingredientIds: [5, 7, 8, 9, 10]
        }
    ];

    const categories = ["Tất cả", "Món Việt", "Món Ý", "Món Âu", "Món Hàn", "Món Nhật"];

    useEffect(() => {
        setTimeout(() => {
            try {
                // Process dishes with full ingredient details
                const processedDishes = dishesList.map(dish => {
                    const dishIngredients = dish.ingredientIds.map(id =>
                        ingredientsList.find(ingredient => ingredient.id === id)
                    ).filter(Boolean); // Remove any undefined ingredients

                    return {
                        ...dish,
                        ingredients: dishIngredients
                    };
                });

                setDishes(processedDishes);
                setFilteredDishes(processedDishes);
                setLoading(false);
            } catch (error) {
                console.error("Error loading dishes:", error);
                setError("Có lỗi xảy ra khi tải dữ liệu món ăn. Vui lòng thử lại sau.");
                setLoading(false);
            }
        }, 800); // Simulate network delay
    }, []);

    useEffect(() => {
        if (activeCategory === "Tất cả") {
            setFilteredDishes(dishes);
        } else {
            const filtered = dishes.filter(dish => dish.category === activeCategory);
            setFilteredDishes(filtered);
        }
    }, [activeCategory, dishes]);

    const handleSearch = (searchTerm) => {
        if (!searchTerm) {
            if (activeCategory === "Tất cả") {
                setFilteredDishes(dishes);
            } else {
                const filtered = dishes.filter(dish => dish.category === activeCategory);
                setFilteredDishes(filtered);
            }
            return;
        }

        const filtered = dishes.filter(dish => {
            const matchesSearch =
                dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (dish.englishName && dish.englishName.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = activeCategory === "Tất cả" || dish.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        setFilteredDishes(filtered);
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

                    {/* Categories section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh Mục Món Ăn</h2>
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                            {categories.map((category, index) => (
                                <button
                                    key={index}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === category
                                        ? "bg-orange-500 text-white"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dishes grid */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {activeCategory === "Tất cả" ? "Tất Cả Món Ăn" : activeCategory}
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((index) => (
                                <div key={index} className="w-full h-80 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : filteredDishes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {filteredDishes.map((dish) => (
                                <DishCard
                                    key={dish.id}
                                    id={dish.id}
                                    image={dish.image}
                                    name={dish.name}
                                    ingredientCount={dish.ingredients.length}
                                    ingredients={dish.ingredients}
                                />
                            ))}
                        </div>
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