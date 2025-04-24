import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosPrivate.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý token hết hạn 
axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu token hết hạn (status 401) và chưa thử refresh token
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Thực hiện refresh token (cần implement API refresh token)
                // const refreshToken = localStorage.getItem('refreshToken');
                // const response = await axios.post(`${BASE_URL}/user/refresh-token`, { refreshToken });
                // const newToken = response.data.token;
                // localStorage.setItem('token', newToken);

                // // Thiết lập token mới cho request ban đầu
                // originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                // return axios(originalRequest);

                // Nếu không có API refresh token, đăng xuất người dùng khi token hết hạn
                localStorage.removeItem('token');
                window.location.href = '/login';
            } catch (err) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosPrivate;