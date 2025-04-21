import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SavedBasketSection from '../components/saved-baskets/SavedBasketSection';
import SavedDishSection from '../components/saved-baskets/SavedDishSection';
import { savedBaskets } from '../assets/savedBasketsData';
import cartIcon from '../assets/images/cart.png';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';


const SavedBasketDetailPage = () => {
    const { basketId } = useParams();
    const navigate = useNavigate();
    const [basket, setBasket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            const foundBasket = savedBaskets.find(basket => basket.id === Number(basketId));

            if (foundBasket) {
                setBasket(foundBasket);
            } else {
                toast.error("Không tìm thấy giỏ hàng đã lưu");
                navigate("/saved-baskets");
            }

            setLoading(false);
        }, 500);
    }, [basketId, navigate]);

    const handleLoadToCart = () => {
        if (basket) {
            const currentBasketJSON = localStorage.getItem('basketItems');
            let currentBasket = currentBasketJSON ? JSON.parse(currentBasketJSON) : { ingredients: [], dishes: {} };

            const ingredientMap = new Map();
            currentBasket.ingredients.forEach(ingredient => {
                ingredientMap.set(ingredient.id, ingredient);
            });

            // Merge ingredients - add quantities if ingredient already exists
            basket.ingredients.forEach(newIngredient => {
                if (ingredientMap.has(newIngredient.id)) {
                    const existingIngredient = ingredientMap.get(newIngredient.id);
                    existingIngredient.quantity = parseFloat((existingIngredient.quantity + newIngredient.quantity).toFixed(1));
                } else {
                    currentBasket.ingredients.push({ ...newIngredient });
                }
            });

            // Merge dishes - handle by unique dish ID
            Object.entries(basket.dishes).forEach(([dishId, newDish]) => {
                let uniqueDishId = dishId;
                let counter = 1;

                while (currentBasket.dishes[uniqueDishId]) {
                    uniqueDishId = `${dishId}_${counter}`;
                    counter++;
                }

                currentBasket.dishes[uniqueDishId] = { ...newDish };
            });

            localStorage.setItem('basketItems', JSON.stringify(currentBasket));

            const event = new CustomEvent('basketUpdated');
            window.dispatchEvent(event);

            toast.success(`Đã thêm "${basket.name}" vào giỏ hàng!`);
            navigate("/basket");
        }
    };

    // fetch api
    const handleDeleteSavedBasket = () => {
        toast.success(`Đã xóa "${basket.name}" khỏi danh sách giỏ hàng đã lưu!`);
        navigate("/saved-baskets");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!basket) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white p-8 text-center">
                        <h2 className="text-xl font-medium mb-4">Không tìm thấy giỏ hàng đã lưu</h2>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-green-600 py-3 px-4 flex justify-between items-center mb-px">
                    <div className="flex items-center gap-2">
                        <img src={cartIcon} alt="" className="h-7 w-7 mr-2" />
                        <h1 className="text-white text-xl font-medium">Giỏ hàng đã lưu</h1>
                    </div>
                    <div className="text-white font-medium">{basket.name}</div>
                </div>
                <div className="bg-white border border-gray-200 border-t-0">
                    {/* Ingredients Section */}
                    {basket.ingredients.length > 0 && (
                        <SavedBasketSection
                            title="Nguyên Liệu"
                            items={basket.ingredients}
                        />
                    )}

                    {/* Dishes Section */}
                    {Object.keys(basket.dishes).length > 0 && (
                        <SavedDishSection dishes={basket.dishes} />
                    )}

                    {/* Actions */}
                    <div className="py-4 flex justify-center gap-4 border-t border-gray-200 mt-4">
                        <button
                            onClick={handleLoadToCart}
                            className="bg-green-600 text-white px-6 py-3 flex items-center justify-center rounded-md"
                        >
                            <FiShoppingCart className="w-5 h-5 mr-2" />
                            Thêm vào giỏ hàng
                        </button>

                        <button
                            onClick={handleDeleteSavedBasket}
                            className="bg-red-500 text-white px-6 py-3 flex items-center justify-center rounded-md"
                        >
                            <FiTrash2 className="w-5 h-5 mr-2" />
                            Xóa khỏi Giỏ hàng đã lưu
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SavedBasketDetailPage;