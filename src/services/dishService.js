import axiosPublic from './axiosPublic';

export const dishService = {

    getDishes: async (pageNo = 0, pageSize = 30) => {
        try {
            const response = await axiosPublic.get(`public/dishes?pageSize=${pageSize}&pageNo=${pageNo}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching dishes (page ${pageNo}):`, error);
            throw error;
        }
    },
    getTotalDishSize: async () => {
        try {
            const response = await axiosPublic.get('/public/dishes/totalSize');
            return response.data;
        } catch (error) {
            console.error('Error fetching total ingredient count:', error);
            throw error;
        }
    }
};