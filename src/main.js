import { createApp } from 'vue'
import App from './App.vue'
import About from './components/About.vue'
import AddTaskItem from './components/AddTaskItem.vue'
import TaskCards from './components/TaskCards.vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import UserSignUp from './components/UserSignUp.vue'
import UserLogin from './components/UserLogin.vue'

const router = createRouter( {
    history: createWebHistory(),
    routes: [
        { path: "/", component: TaskCards },
        { path: "/tasks", component: TaskCards },
        { path: "/tasks/add", component: AddTaskItem },
        { path: "/login", component: UserLogin },
        { path: "/signup", component: UserSignUp },
        { path: "/about", component: About }
    ]
})

const app = createApp(App)
app.use(router)
app.component('task-cards', TaskCards)
app.mount('#app')