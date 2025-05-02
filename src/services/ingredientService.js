import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const ingredientService = {
    // Get information about a specific ingredient by ID
    getIngredientById: async (id) => {
        try {
            const response = await axiosPublic.get(`/public/ingredients/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ingredient with ID ${id}:`, error);
            throw error;
        }
    },

    getIngredients: async (pageNo = 0, pageSize = 32) => {
        try {
            const response = await axiosPublic.get(`/public/ingredients?pageSize=${pageSize}&pageNo=${pageNo}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ingredients (page ${pageNo}):`, error);
            throw error;
        }
    },
    getTotalIngredientSize: async () => {
        try {
            const response = await axiosPublic.get('/public/ingredients/totalSize');
            return response.data;
        } catch (error) {
            console.error('Error fetching total ingredient count:', error);
            throw error;
        }
    }
};

export default ingredientService;