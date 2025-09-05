import { createApp } from 'vue'
import App from './App.vue'
import TaskCards from './components/TaskCards.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'

const app = createApp(App)
app.use(router)
app.use(store)
app.component('task-cards', TaskCards)
app.mount('#app')