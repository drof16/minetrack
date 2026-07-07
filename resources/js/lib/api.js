import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            window.location.assign('/login');
        }

        return Promise.reject(error);
    }
);

export async function csrf() {
    await axios.get('/sanctum/csrf-cookie', {
        withCredentials: true,
        withXSRFToken: true,
    });
}
