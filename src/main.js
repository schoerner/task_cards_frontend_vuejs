import { createApp } from 'vue'
import App from './App.vue'
import About from './components/About.vue'
import AddTask from './components/AddTask.vue'
import TaskCards from './components/TaskCards.vue'
import { createRouter, createWebHistory } from 'vue-router'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import UserSignUp from './components/UserSignUp.vue'
import UserLogin from './components/UserLogin.vue'
import UserProfile from "@/components/UserProfile.vue";

const app = createApp(App)
app.use(router)
app.use(store)
app.component('task-cards', TaskCards)
app.mount('#app')