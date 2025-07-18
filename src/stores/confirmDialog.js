// src/store/snackbar.js (Pinia 示例)
import { defineStore } from "pinia";

export const useConfirmDialog = defineStore("confirmDialog", {
  state: () => ({
    show: false,
    message: "",
    resolveCallback: null // 存储用户选择结果的回调
  }),
  actions: {
    openConfirmDialog(data) {
      this.show = true;
      this.message = data.text;
      return new Promise((resolve) => {
        this.resolveCallback = resolve; // 保存resolve供后续调用
      });
    },
    handleUserChoice(confirmed) {
      if (this.resolveCallback) {
        this.resolveCallback(confirmed); // 返回用户选择结果
        this.resolveCallback = null; // 清空避免内存泄漏
      }
      this.show = false;
    },
  },
});
