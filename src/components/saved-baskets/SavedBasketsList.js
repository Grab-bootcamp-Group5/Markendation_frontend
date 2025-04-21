import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiCalendar, FiChevronRight } from 'react-icons/fi';
import { images } from '../../assets/assets';

const SavedBasketsList = ({ baskets }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex bg-green-600 py-3 px-4">
                <img src={images.cart} alt="" className="h-7 w-7 mr-2" />
                <h2 className="text-white text-xl font-medium">Giỏ Hàng Đã Lưu</h2>
            </div>

            <div className="divide-y divide-gray-100">
                {baskets.map((basket) => (
                    <Link
                        key={basket.id}
                        to={`/saved-baskets/${basket.id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <FiShoppingBag className="text-orange-500 w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <h3 className="font-medium text-lg text-gray-900">{basket.name}</h3>
                                <div className="flex items-center text-gray-500 text-sm mt-1">
                                    <FiCalendar className="w-4 h-4 mr-1" />
                                    <span>{formatDate(basket.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <FiChevronRight className="text-gray-400 w-5 h-5" />
                    </Link>
                ))}
            </div>

            {baskets.length === 0 && (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiShoppingBag className="text-gray-400 w-8 h-8" />
                    </div>
                    <p className="text-gray-500">Bạn chưa có giỏ hàng đã lưu nào</p>
                </div>
            )}
        </div>
    );
};

export default SavedBasketsList;