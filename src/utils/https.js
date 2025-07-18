// src/utils/http.js
import axios from "axios";
// import { useSnackbar } from "vuetify/lib/components/index.mjs"; // 根据实际路径调整
import { useSnackbarStore } from "@/stores/snackbar.js";
const snackbar = useSnackbarStore();

import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础URL
  timeout: 60000, // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token（根据实际存储方式调整）
    // const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (localStorage.getItem("user") == null) {
      // ★★★ 关键修改 1: 抛出特定错误而不是直接路由跳转 ★★★
      import("@/router").then((routerModule) => {
        routerModule.default.push("/login");
      });

      const error = new Error("未登录");
      error.config = config;
      error.isAuthError = true; // 自定义标记
      throw error; // 抛出错误让响应拦截器处理
    }
    const token = localStorage.getItem("user");
    // 自动添加Authorization头
    if (JSON.parse(token).userAccessToken) {
      config.headers.Authorization = `Bearer ${
        JSON.parse(token).userAccessToken
      }`; // Bearer方案
      // 或根据后端要求使用其他格式：
      // config.headers.Authorization = token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 处理响应数据（根据后端接口格式调整）
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      // 业务逻辑错误处理
      handleError(response.data.message || "Error");
      return Promise.reject(response.data);
    }
  },
  (error) => {
    console.error("请求失败", error);
    // HTTP状态码错误处理
    let errorMessage = "请求错误";
    if (error.isAuthError || error.response.status === 401) {
      // 1. 清除失效凭证
      localStorage.removeItem("token");
      snackbar.openSnackbar({
        color: "red-darken-2",
        text: "登录已过期，请重新登录",
      });

      // ★★★ 关键修改 2: 动态引入路由并跳转 ★★★
      import("@/router").then((routerModule) => {
        routerModule.default.push("/login");
      });

      return Promise.reject(new Error("登录已过期"));
    }
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = "请求参数错误";
          break;
        case 401:
          errorMessage = "登录已过期，请重新登录";
          // 这里可以触发退出登录逻辑
          break;
        case 403:
          errorMessage = "没有权限访问";
          break;
        case 404:
          errorMessage = "请求资源不存在";
          break;
        case 500:
          errorMessage = "服务器错误";
          break;
        default:
          errorMessage = `连接错误 ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = "网络连接异常，请检查网络";
    }
    handleError(errorMessage);
    return Promise.reject(error);
  }
);

// 错误处理函数（使用Vuetify的Snackbar）
function handleError(message) {
  //   const snackbar = useSnackbar();
  snackbar.openSnackbar({
    color: "red-darken-2",
    text: message,
  });
  console.error(message);
}

//  请求方法封装

const http = {
  get(url, params) {
    return service.get(url, { params });
  },

  post(url, data) {
    return service.post(url, data);
  },

  put(url, data) {
    return service.put(url, data);
  },

  delete(url, data) {
    return service.delete(url, { data });
  },

  // 文件上传封装
  upload(url, file) {
    // const formData = new FormData();
    // if (file.length) {
    //   file.forEach((element) => {
    //     formData.append("file", element);
    //   });
    // } else {
    //   formData.append("file", file);
    // }
    return service.post(url, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  download(url, params) {
    return service({
      url,
      method: "GET",
      responseType: "arraybuffer", // 关键配置
      params,
      // isDownload: true, // 特殊标识，避免响应拦截器处理
    });
  },
  donwloadPost(url, data) {
    return service({
      url,
      method: "post",
      responseType: "blob", // 关键配置
      data,
    });
  },
};

export default http;
