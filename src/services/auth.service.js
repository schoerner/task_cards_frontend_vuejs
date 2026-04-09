import axios from 'axios';
import TaskAppConfig from "@/task_app.config.js";
import { jwtDecode } from "jwt-decode";

const API_URL = TaskAppConfig.baseUrl() + '/auth';
const USER_STORAGE_KEY = 'user';
const AUTH_MESSAGE_KEY = 'authMessage';

function buildStoredUser(accessToken, refreshToken, expiresIn, refreshExpiresIn) {
    const userDetails = jwtDecode(accessToken);

    return {
        id: userDetails.id,
        username: userDetails.username,
        email: userDetails.email,
        roles: userDetails.roles,
        token: accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresIn
    };
}

class AuthService {
    login(user) {
        return axios.post(API_URL + '/login', {
            email: user.email,
            password: user.password
        }).then(response => {
            const data = response.data;

            if (data.token) {
                const userToStore = buildStoredUser(
                    data.token,
                    data.refreshToken,
                    data.expiresIn,
                    data.refreshExpiresIn
                );
                this.setStoredUser(userToStore);
                return userToStore;
            }

            return data;
        });
    }

    refreshToken() {
        const user = this.getStoredUser();

        if (!user?.refreshToken) {
            return Promise.reject(new Error('Kein Refresh-Token vorhanden.'));
        }

        return axios.post(API_URL + '/refresh', {
            refreshToken: user.refreshToken
        }).then(response => {
            const data = response.data;
            const updatedUser = buildStoredUser(
                data.token,
                data.refreshToken,
                data.expiresIn,
                data.refreshExpiresIn
            );
            this.setStoredUser(updatedUser);
            return updatedUser;
        });
    }

    logout() {
        const user = this.getStoredUser();

        if (user?.refreshToken) {
            axios.post(API_URL + '/logout', {
                refreshToken: user.refreshToken
            }).catch(() => {});
        }

        localStorage.removeItem(USER_STORAGE_KEY);
    }

    forceLogout(message = 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.') {
        localStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
    }

    getLogoutMessage() {
        const message = sessionStorage.getItem(AUTH_MESSAGE_KEY);
        if (message) {
            sessionStorage.removeItem(AUTH_MESSAGE_KEY);
        }
        return message;
    }

    getStoredUser() {
        return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    }

    setStoredUser(user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    isTokenExpired(token) {
        if (!token) {
            return true;
        }

        try {
            const decoded = jwtDecode(token);
            if (!decoded?.exp) {
                return true;
            }
            return decoded.exp * 1000 <= Date.now();
        } catch {
            return true;
        }
    }

    register(user) {
        return axios.post(API_URL + '/signup', {
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    }
}

export default new AuthService();