import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const ingredientService = {
    // Lấy thông tin của một ingredient theo ID
    getIngredientById: (id) => {
        return axiosPublic.get(`/ingredients/${id}`);
    },

    // Lấy danh sách ingredients theo trang
    getIngredients: (pageNo = 1, pageSize = 30) => {
        return axiosPublic.get(`/ingredients?pageSize=${pageSize}&pageNo=${pageNo}`);
    }
};
