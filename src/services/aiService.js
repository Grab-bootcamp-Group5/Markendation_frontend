import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const aiService = {
    // Gợi ý món ăn dựa trên text input
    getDishSuggestionByText: (textInput) => {
        return axiosPublic.post('/ai/text', { text: textInput });
    },

    getDishSuggestionByImage: async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await axiosPrivate.post('ai/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error in dish suggestion API:", error);
            throw error;
        }
    }
};
