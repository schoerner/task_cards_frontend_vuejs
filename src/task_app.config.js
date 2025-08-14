
class TaskAppConfig {
    static baseUrl() {
        const docker = true;
        return docker ? "" : "http://localhost:8088";
    }
}

export default TaskAppConfig;