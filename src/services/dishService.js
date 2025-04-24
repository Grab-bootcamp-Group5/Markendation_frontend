import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const dishService = {
    // Lấy thông tin của một dish theo ID
    getDishById: (id) => {
        return axiosPublic.get(`/dishes/${id}`);
    },

    // Lấy danh sách dishes theo trang
    getDishes: (pageNo = 1, pageSize = 30) => {
        return axiosPublic.get(`/dishes?pageSize=${pageSize}&pageNo=${pageNo}`);
    }
};