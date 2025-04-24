import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const userService = {
    // Đăng ký người dùng mới
    register: (userData) => {
        return axiosPublic.post('/user/register', userData);
    },

    // Đăng nhập
    login: (credentials) => {
        return axiosPublic.post('/user/login', credentials);
    },

    // Lấy thông tin người dùng
    getUserInfo: () => {
        return axiosPrivate.get('/user');
    },

    // Cập nhật vị trí người dùng
    updateUserLocation: (locationData) => {
        return axiosPrivate.post('/user/location', locationData);
    }
};