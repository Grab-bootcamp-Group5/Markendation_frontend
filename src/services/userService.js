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
    },

    // Save user data to localStorage
    saveUserToLocalStorage: (userData) => {
        if (userData) {
            const userToSave = {
                ...userData,
                password: undefined
            };

            localStorage.setItem('user', JSON.stringify(userToSave));
            return true;
        }
        return false;
    },

    // Helper function to get user from localStorage
    getUserFromLocalStorage: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    // Clear user data from localStorage
    clearUserFromLocalStorage: () => {
        localStorage.removeItem('user');
    }
};

export default userService;