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
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900"
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/ingredients-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900"
                    }
                >
                    Ingredients Bank
                </NavLink>
                <NavLink
                    to="/dishes-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900"
                    }
                >
                    Dishes Bank
                </NavLink>
                <NavLink
                    to="/basket"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900"
                    }
                >
                    Basket
                </NavLink>
            </div>

            {/* Auth Button */}
            <div>
                <button className="bg-gray-900 text-white px-6 py-2 rounded-full">Login/Signup</button>
            </div>
        </nav>
    );
};

export default Navbar;