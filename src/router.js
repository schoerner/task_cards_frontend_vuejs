import { createWebHistory, createRouter } from "vue-router";
import TaskCards from "@/components/TaskCards.vue";
import CreateTask from "@/components/CreateTask.vue";
import UserLogin from "@/components/UserLogin.vue";
import UserSignUp from "@/components/UserSignUp.vue";
import About from "@/components/About.vue";
import Welcome from "@/components/Welcome.vue";
import MyOwnedProjectManager from "@/components/MyOwnedProjectManager.vue";
import CreateProject from "@/components/CreateProject.vue";
import ProjectMemberOverview from "@/components/ProjectMemberOverview.vue";
// lazy-loaded
const UserProfile = () => import("./components/UserProfile.vue")
//const BoardAdmin = () => import("./components/BoardAdmin.vue")
//const BoardModerator = () => import("./components/BoardModerator.vue")
//const BoardUser = () => import("./components/BoardUser.vue")

const routes = [
    { path: "/", component: Welcome },
    { path: "/tasks", component: TaskCards },
    { path: "/tasks/add", component: CreateTask },
    { path: "/projects/member", component: ProjectMemberOverview },
    { path: "/projects", component: MyOwnedProjectManager },
    { path: "/projects/create", component: CreateProject },
    { path: "/login", component: UserLogin },
    { path: "/signup", component: UserSignUp },
    { path: "/about", component: About },
    {
        path: "/profile",
        name: "UserProfile",
        // lazy-loaded
        component: UserProfile,
    },
    /*
    {
        path: "/admin",
        name: "admin",
        // lazy-loaded
        component: BoardAdmin,
    },
    {
        path: "/mod",
        name: "moderator",
        // lazy-loaded
        component: BoardModerator,
    },
    {
        path: "/user",
        name: "user",
        // lazy-loaded
        component: BoardUser,
    },
    */
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const publicPages = ['/', '/login', '/signup', '/about'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('user');

    // trying to access a restricted page + not logged in
    // redirect to login page
    if (authRequired && !loggedIn) {
        next('/login');
    } else {
        next();
    }
});

export default router;