import axiosPrivate from './axiosPrivate';

export const userService = {
    // Get user information
    getUserInfo: async () => {
        try {
            const response = await axiosPrivate.get('/user');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update user location
    updateUserLocation: async (locationData) => {
        try {
            const response = await axiosPrivate.post('/user/location', locationData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;