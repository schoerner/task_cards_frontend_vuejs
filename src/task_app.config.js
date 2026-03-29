class TaskAppConfig {
    static baseUrl() {
        return import.meta.env.VITE_API_URL || "http://localhost:8080";
    }
}

export default TaskAppConfig;