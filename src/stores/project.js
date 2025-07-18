// Utilities
import { defineStore } from "pinia";

export const useProjectStore = defineStore("project", {
  state: () => ({
    //
    project: {},
  }),
  actions: {
    // 更新project信息
    setProject(payload) {
      console.log("setProject", payload);
      this.project = payload.project;
    },
  },
  persist: true, // 使用持久化插件（需安装 pinia-plugin-persistedstate）
});
