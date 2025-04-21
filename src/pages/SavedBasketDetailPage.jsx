import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SavedBasketHeader from '../components/saved-baskets/SavedBasketHeader';
import SavedBasketSection from '../components/saved-baskets/SavedBasketSection';
import SavedDishSection from '../components/saved-baskets/SavedDishSection';
import BasketActions from '../components/saved-baskets/BasketActions';
import { savedBaskets } from '../assets/savedBasketsData';

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
            localStorage.setItem('basketItems', JSON.stringify({
                ingredients: basket.ingredients,
                dishes: basket.dishes
            }));

            const event = new CustomEvent('basketUpdated');
            window.dispatchEvent(event);

            toast.success(`Đã thêm "${basket.name}" vào giỏ hàng!`);
            navigate("/basket");
        }
    };

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
                <SavedBasketHeader basketName={basket.name} />

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
                    <BasketActions
                        onLoadToCart={handleLoadToCart}
                        onDelete={handleDeleteSavedBasket}
                    />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SavedBasketDetailPage;