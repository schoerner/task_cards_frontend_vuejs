import { createWebHistory, createRouter } from 'vue-router';
import store from '@/store';
import AuthService from '@/services/auth.service';

import About from '@/components/About.vue';
import AdminBackups from '@/components/AdminBackups.vue';
import Boards from '@/components/Boards.vue';
import Datenschutz from './components/Datenschutz.vue'
import TaskCalendar from '@/components/TaskCalendar.vue';
import UserLogin from '@/components/UserLogin.vue';
import UserSignUp from '@/components/UserSignUp.vue';
import Impressum from '@/components/Impressum.vue';
import Welcome from '@/components/Welcome.vue';
import MyOwnedProjectManager from '@/components/MyOwnedProjectManager.vue';
import ProjectMemberOverview from '@/components/ProjectMemberOverview.vue';
import UserManagement from '@/components/UserManagement.vue';
import TaskPollBuilder from '@/components/TaskPollBuilder.vue';
import TaskPollOverview from '@/components/TaskPollOverview.vue';
import TaskPollPublicPage from '@/components/TaskPollPublicPage.vue';

const FocusPage = () => import('@/components/FocusPage.vue');
const UserProfile = () => import('@/components/UserProfile.vue');
const UserProfiles = () => import('@/components/UserProfiles.vue');

const routes = [
    { path: '/', component: Welcome },
    { path: '/about', component: About },
    { path: '/admin/backups', component: AdminBackups, meta: { requiresAdmin: true } },
    { path: '/user-management', component: UserManagement, meta: { requiresAdmin: true } },
    { path: '/boards', component: Boards, meta: { requiresAuth: true } },
    { path: '/calendar', component: TaskCalendar, meta: { requiresAuth: true } },
    { path: '/focus', component: FocusPage, meta: { requiresAuth: true } },
    { path: '/datenschutz', name: 'datenschutz', component: Datenschutz, meta: { title: 'Datenschutz' } },
    { path: '/polls', component: TaskPollOverview, meta: { requiresAuth: true } },
    { path: '/polls/task/:taskId', component: TaskPollBuilder, meta: { requiresAuth: true } },
    { path: '/polls/respond/:token', component: TaskPollPublicPage, meta: { requiresAuth: false } },
    { path: '/projects', component: MyOwnedProjectManager, meta: { requiresAuth: true } },
    { path: '/projects/member', component: ProjectMemberOverview, meta: { requiresAuth: true } },
    { path: '/login', component: UserLogin },
    { path: '/signup', component: UserSignUp, meta: { requiresAdmin: true } },
    { path: '/impressum', component: Impressum },
    { path: '/profile', name: 'UserProfile', component: UserProfile, meta: { requiresAuth: true } },
    { path: '/user_profiles/:userId?', name: 'UserProfiles', component: UserProfiles, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const currentUser = store.getters['auth/currentUser'];

    if (currentUser?.token && AuthService.isTokenExpired(currentUser.token)) {
        try {
            await store.dispatch('auth/restoreSession');
        } catch {
            if (to.path !== '/login') {
                next('/login');
                return;
            }
        }
    }

    const effectiveLoggedIn = store.getters['auth/loggedIn'];
    const isAdmin = store.getters['auth/isAdmin'];

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