
class TaskAppConfig {
    static baseUrl() {
        const docker = true;
        return docker ? "" : "http://localhost:8080";
    }
}

export default TaskAppConfig;