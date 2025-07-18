// src/store/snackbar.js (Pinia 示例)
import { defineStore } from "pinia";

export const useOverlayStore = defineStore("overlay", {
  state: () => ({
    show: false,
  }),
  actions: {
    openOverlay(data) {
      this.show = data;
    },
  },
});
