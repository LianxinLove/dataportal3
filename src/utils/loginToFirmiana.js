// src/utils/specialAxios.js
import axios from "axios";
import qs from "qs";
const loginToFirmiana = axios.create({
  baseURL: import.meta.env.VITE_SPECIAL_API,
  timeout: 15000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  },
  transformRequest: [(data) => qs.stringify(data)],
});

// 添加认证拦截器
loginToFirmiana.interceptors.request.use((config) => {
  config.auth = {
    username: import.meta.env.VITE_APP_AUTH_USER,
    password: import.meta.env.VITE_APP_AUTH_PASS,
  };
  return config;
});

export default loginToFirmiana;
