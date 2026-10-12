
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData) {
            // Let the browser/Axios set the multipart boundary.
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
