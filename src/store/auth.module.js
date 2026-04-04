import AuthService from '../services/auth.service';

const user = JSON.parse(localStorage.getItem('user'));
const initialState = user
    ? { status: { loggedIn: true }, user }
    : { status: { loggedIn: false }, user: null };

export const auth = {
    namespaced: true,
    state: initialState,

    getters: {
        loggedIn(state) {
            return state.status.loggedIn;
        },
        currentUser(state) {
            return state.user;
        },
        roles(state) {
            if (!state.user || !state.user.roles) {
                return [];
            }

            return state.user.roles.map(role => {
                if (typeof role === 'string') {
                    return role;
                }
                return role.name;
            }).filter(Boolean);
        },
        isUser(state, getters) {
            return getters.roles.includes('ROLE_USER');
        },
        isModerator(state, getters) {
            return getters.roles.includes('ROLE_MODERATOR');
        },
        isAdmin(state, getters) {
            return getters.roles.includes('ROLE_ADMIN');
        }
    },

    actions: {
        login({ commit }, user) {
            return AuthService.login(user).then(
                user => {
                    commit('loginSuccess', user);
                    return Promise.resolve(user);
                },
                error => {
                    commit('loginFailure');
                    return Promise.reject(error);
                }
            );
        },
        logout({ commit }) {
            AuthService.logout();
            commit('logout');
        },
        register({ commit }, user) {
            return AuthService.register(user).then(
                response => {
                    commit('registerSuccess');
                    return Promise.resolve(response.data);
                },
                error => {
                    commit('registerFailure');
                    return Promise.reject(error);
                }
            );
        }
    },

    mutations: {
        loginSuccess(state, user) {
            state.status.loggedIn = true;
            state.user = user;
        },
        loginFailure(state) {
            state.status.loggedIn = false;
            state.user = null;
        },
        logout(state) {
            state.status.loggedIn = false;
            state.user = null;
        },
        registerSuccess(state) {
            state.status.loggedIn = false;
        },
        registerFailure(state) {
            state.status.loggedIn = false;
        }
    }
};