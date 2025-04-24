import axiosPublic from './axiosPublic';

export const aiService = {
    // Gợi ý món ăn dựa trên text input
    getDishSuggestionByText: (textInput) => {
        return axiosPublic.post('/ai/text', { text: textInput });
    },

    // Gợi ý món ăn dựa trên image input
    getDishSuggestionByImage: (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);

        return axiosPublic.post('/ai/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
