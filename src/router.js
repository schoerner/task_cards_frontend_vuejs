import { createWebHistory, createRouter } from 'vue-router';
import store from '@/store';
import AuthService from '@/services/auth.service';

import About from '@/components/About.vue';
import Boards from '@/components/Boards.vue';
import TaskCalendar from '@/components/TaskCalendar.vue';
import UserLogin from '@/components/UserLogin.vue';
import UserSignUp from '@/components/UserSignUp.vue';
import Impressum from '@/components/Impressum.vue';
import Welcome from '@/components/Welcome.vue';
import MyOwnedProjectManager from '@/components/MyOwnedProjectManager.vue';
import ProjectMemberOverview from '@/components/ProjectMemberOverview.vue';
import UserManagement from '@/components/UserManagement.vue';

const UserProfile = () => import('@/components/UserProfile.vue');
const UserProfiles = () => import('@/components/UserProfiles.vue');

const routes = [
    { path: '/', component: Welcome },
    { path: '/boards', component: Boards, meta: { requiresAuth: true } },
    { path: '/calendar', component: TaskCalendar, meta: { requiresAuth: true } },
    { path: '/projects', component: MyOwnedProjectManager, meta: { requiresAuth: true } },
    { path: '/projects/member', component: ProjectMemberOverview, meta: { requiresAuth: true } },
    { path: '/login', component: UserLogin },
    { path: '/signup', component: UserSignUp, meta: { requiresAdmin: true } },
    { path: '/about', component: About },
    { path: '/impressum', component: Impressum },
    { path: '/profile', name: 'UserProfile', component: UserProfile, meta: { requiresAuth: true } },
    { path: '/user_profiles/:userId?', name: 'UserProfiles', component: UserProfiles, meta: { requiresAuth: true } },
    { path: '/user-management', component: UserManagement, meta: { requiresAdmin: true } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const currentUser = store.getters['auth/currentUser'];
    const loggedIn = store.getters['auth/loggedIn'];
    const isAdmin = store.getters['auth/isAdmin'];

    if (currentUser?.token && AuthService.isTokenExpired(currentUser.token)) {
        AuthService.forceLogout('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
        store.commit('auth/logout');
    }

    const effectiveLoggedIn = store.getters['auth/loggedIn'];

    if (to.meta.requiresAdmin) {
        if (!effectiveLoggedIn) {
            next('/login');
            return;
        }

        if (!isAdmin) {
            next('/boards');
            return;
        }
    }

    if (to.meta.requiresAuth && !effectiveLoggedIn) {
        next('/login');
        return;
    }

    next();
});

export default router;