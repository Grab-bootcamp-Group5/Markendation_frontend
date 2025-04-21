import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SavedBasketsList from '../components/saved-baskets/SavedBasketsList';
import { savedBaskets } from '../assets/savedBasketsData';

const SavedBasketsPage = () => {
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            setBaskets(savedBaskets);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <SavedBasketsList baskets={baskets} />
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SavedBasketsPage;