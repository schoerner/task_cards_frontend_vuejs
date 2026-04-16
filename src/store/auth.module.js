import AuthService from '../services/auth.service';

const storedUser = AuthService.getStoredUser();

const initialState = storedUser
    ? { status: { loggedIn: true }, user: storedUser }
    : { status: { loggedIn: false }, user: null };

function normalizeRoles(user) {
    if (!user || !Array.isArray(user.roles)) {
        return [];
    }

    return user.roles
        .map(role => {
            if (typeof role === 'string') {
                return role;
            }
            return role?.name;
        })
        .filter(Boolean);
}

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

        userId(state) {
            return state.user?.id ?? null;
        },

        roles(state) {
            return normalizeRoles(state.user);
        },

        isUser(state, getters) {
            return getters.roles.includes('ROLE_USER');
        },

        isAdmin(state, getters) {
            return getters.roles.includes('ROLE_ADMIN');
        },

        hasRole: (state, getters) => (roleName) => {
            return getters.roles.includes(roleName);
        },

        isSelf: (state) => (userId) => {
            if (!state.user?.id || userId == null) {
                return false;
            }
            return Number(state.user.id) === Number(userId);
        }
    },

    actions: {
        login({ commit }, credentials) {
            return AuthService.login(credentials).then(
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
        },

        async restoreSession({ commit }) {
            const user = AuthService.getStoredUser();

            if (!user) {
                commit('logout');
                return null;
            }

            if (!AuthService.isTokenExpired(user.token)) {
                commit('loginSuccess', user);
                return user;
            }

            try {
                const refreshedUser = await AuthService.refreshToken();
                commit('loginSuccess', refreshedUser);
                return refreshedUser;
            } catch (error) {
                AuthService.forceLogout('Ihre Sitzung ist abgelaufen.\nBitte melden Sie sich erneut an.');
                commit('logout');
                throw error;
            }
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
        },

        updateStoredUser(state, user) {
            state.user = user;
            state.status.loggedIn = !!user;
        }
    }
};