import axios from "axios";

export const api = axios.create({
    baseURL: "https://mybooknestbackend-production.up.railway.app",
    headers: {
        "Content-Type": "application/json",
    },
});
