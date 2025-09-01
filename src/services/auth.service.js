import axios from 'axios';
import TaskAppConfig from "@/task_app.config.js";
import {jwtDecode} from "jwt-decode";

const API_URL = TaskAppConfig.baseUrl() + '/api/auth';

class AuthService {
    login(user) {
        console.group("LOGIN", user);
        console.log(API_URL);
        return axios
            .post(API_URL + '/login', {
                email: user.email,
                password: user.password
            })
            .then(response => {
                console.log('Login success');
                console.log(response.data);

                if (response.data.token) {
                    const userDetails = jwtDecode(response.data.token)
                    console.log("AuthService.login().userDetails", userDetails);
                    const userToStore = {
                        id: userDetails.id,
                        username: userDetails.username,
                        email: userDetails.email,
                        token: response.data.token,
                        expiresIn: response.data.expiresIn
                    };
                    console.log("AuthService.login().user", userToStore);
                    localStorage.setItem('user', JSON.stringify(userToStore));
                    return userToStore;
                }

                // todo what to return else?
                console.log("AuthService.login().response.data", response.data);
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem('user');
    }

    register(user) {
        console.log("auth.service.js -> register", user);
        console.log("url: ", API_URL + '/signup');
        return axios.post(API_URL + '/signup', {
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    }
}

export default new AuthService();
