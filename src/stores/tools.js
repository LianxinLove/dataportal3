// Utilities
import { defineStore } from "pinia";

export const useToolStore = defineStore("tool", {
  state: () => ({
    //
    tool: {},
  }),
  actions: {
    // 更新project信息
    setTool(payload) {
      this.tool = payload.tool;
    },
  },
  persist: true, // 使用持久化插件（需安装 pinia-plugin-persistedstate）
});
