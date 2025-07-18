// stores/user.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    firmianaToken: null, // Firmiana访问令牌
    userAccessToken: null, // 用户访问令牌
    userRefreshToken: null, // 用户刷新令牌
  }),
  actions: {
    // 更新用户信息
    setUser(payload) {
      console.log("Setting user information:", payload);
      this.firmianaToken = payload.firmianaToken || null;
      this.userAccessToken = payload.userAccessToken || null;
      this.userRefreshToken = payload.userRefreshToken || null;
      // this.expires_in = payload.expires_in || null;
    },
    // 清除用户信息
    clearUser() {
      // this.firmianaToken.accessToken = null;
      // this.firmianaToken.refreshToken = null;
      // this.userToken.accessToken = null;
      // this.userToken.refreshToken = null;
      // this.userToken.expires_in = null;
    },
  },
  getters: {
    // 判断是否登录
    isAuthenticated: (state) => !!state.accessToken,
    // 获取用户名
    username: (state) => state.user?.username || "未登录用户",
  },
  persist: true, // 使用持久化插件（需安装 pinia-plugin-persistedstate）
});
