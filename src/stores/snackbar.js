// src/store/snackbar.js (Pinia 示例)
import { defineStore } from "pinia";

export const useSnackbarStore = defineStore("snackbar", {
  state: () => ({
    show: false,
    message: "",
    color: "success",
  }),
  actions: {
    openSnackbar(data) {
      this.show = true;
      this.message = data.text;
      this.color = data.color;
    },
  },
});
