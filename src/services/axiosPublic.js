import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

const axiosPublic = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosPublic;