import axios from 'axios';
import { userService } from './userService';

const API_URL = process.env.REACT_APP_API_URL;

export const authService = {
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);

            if (response.data.token) {
                localStorage.setItem('accessToken', response.data.token);
                const userData = await userService.getUserInfo();
                userService.saveUserToLocalStorage(userData);
            }

            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);

            if (response.data.token) {
                localStorage.setItem('accessToken', response.data.token);
                const userInfo = await userService.getUserInfo();
                userService.saveUserToLocalStorage(userInfo);
            }

            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Không xóa giỏ hàng để giữ lại các mặt hàng cho người dùng không đăng nhập
    },

    refreshToken: async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
                token: localStorage.getItem('refreshToken')
            });

            if (response.data.token) {
                localStorage.setItem('accessToken', response.data.token);
            }

            return response.data;
        } catch (error) {
            console.error('Token refresh failed:', error);
            authService.logout();
            throw error;
        }
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    }
};