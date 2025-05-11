import axios from 'axios';
import { userService } from './userService';

const API_URL = process.env.REACT_APP_API_URL;

export const authService = {
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);

                // Lưu refreshToken nếu có
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }

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
            // Đảm bảo đúng cấu trúc dữ liệu gửi đi
            const registerData = {
                fullname: userData.username,
                email: userData.email,
                password: userData.password
            };

            const response = await axios.post(`${API_URL}/auth/register`, registerData);

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);

                // Lưu refreshToken nếu có
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }

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
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Không xóa giỏ hàng để giữ lại các mặt hàng cho người dùng không đăng nhập
    },

    refreshToken: async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: localStorage.getItem('refreshToken')
            });

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);

                // Cập nhật refreshToken mới nếu có
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
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