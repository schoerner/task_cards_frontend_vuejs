import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

async function bootstrap() {
    try {
        await store.dispatch('auth/restoreSession');
    } catch {
        // bewusst leer:
        // Router/Store behandeln den ausgelaufenen Fall
    }

    const app = createApp(App);
    app.use(router);
    app.use(store);
    app.mount('#app');
}

await bootstrap();
