// Utilities
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    //
    barSelected: "Project",
    barOpened: [''],
  }),
  actions: {
    // 更新用户信息
    setSelect(payload) {
      console.log("setSelect", payload);
      this.barSelected = payload.barSelected || "Project";
      this.barOpened[0] = payload.barOpened || [""];
    },
  },
  persist: true, // 使用持久化插件（需安装 pinia-plugin-persistedstate）
});
