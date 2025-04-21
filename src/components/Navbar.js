import React from 'react';
import { NavLink } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
                <img src={logoImage} alt="Markendation Logo" className="w-32 mr-2" />
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-4">
                <NavLink
                    to="/homepage"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Trang chủ
                </NavLink>
                <NavLink
                    to="/ingredients-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Ngân hàng nguyên liệu
                </NavLink>
                <NavLink
                    to="/dishes-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Ngân hàng món ăn
                </NavLink>
                <NavLink
                    to="/saved-baskets"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Giỏ hàng đã lưu
                </NavLink>
            </div>

            {/* Auth Button */}
            <div>
                <button className="bg-gray-900 text-white px-6 py-2 rounded-full font-medium">Đăng nhập/Đăng kí</button>
            </div>
        </nav>
    );
};

export default Navbar;