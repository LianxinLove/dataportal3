// Utilities
import { defineStore } from "pinia";

export const useAnalysisStore = defineStore("analysis", {
  state: () => ({
    //
    analysis: {},
    project: {},
    workflow: {},
  }),
  actions: {
    //
    setAnalysis(payload) {
      this.analysis = payload.analysis;
    },
    setProject(payload) {
      this.project = payload.project;
    },
    setWorkflow(payload) {
      this.workflow = payload.workflow;
    },
  },
  persist: true, // 使用持久化插件（需安装 pinia-plugin-persistedstate）
});
