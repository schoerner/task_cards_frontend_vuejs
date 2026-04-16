import axios from 'axios';
import router from '@/router';
import store from '@/store';
import authHeader from '@/services/auth-header';
import AuthService from '@/services/auth.service';

const api = axios.create();

api.interceptors.request.use((config) => {
    const headers = authHeader();
    config.headers = {
        ...(config.headers || {}),
        ...headers
    };
    return config;
});

let isRefreshing = false;
let pendingRequests = [];

function resolvePendingRequests(error, token = null) {
    pendingRequests.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    pendingRequests = [];
}

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const status = error?.response?.status;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isRefreshCall = originalRequest.url?.includes('/auth/refresh');
        const isLoginCall = originalRequest.url?.includes('/auth/login');

        if (status === 401 && !originalRequest._retry && !isRefreshCall && !isLoginCall) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingRequests.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject
                    });
                });
            }

            isRefreshing = true;

            try {
                const updatedUser = await AuthService.refreshToken();
                store.commit('auth/loginSuccess', updatedUser);
                resolvePendingRequests(null, updatedUser.token);
                originalRequest.headers.Authorization = `Bearer ${updatedUser.token}`;
                return api(originalRequest);
            } catch (refreshError) {
                resolvePendingRequests(refreshError, null);
                AuthService.forceLogout('Ihre Sitzung ist abgelaufen.\nBitte melden Sie sich erneut an.');
                store.commit('auth/logout');

                if (router.currentRoute.value.path !== '/login') {
                    await router.push('/login');
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (status === 401 && isRefreshCall) {
            AuthService.forceLogout('Ihre Sitzung ist abgelaufen.\nBitte melden Sie sich erneut an.');
            store.commit('auth/logout');

            if (router.currentRoute.value.path !== '/login') {
                await router.push('/login');
            }
        }

        return Promise.reject(error);
    }
);

export default api;