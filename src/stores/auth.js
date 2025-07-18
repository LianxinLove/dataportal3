// src/stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    router: null,
  }),
  actions: {
    setRouter(router) {
      this.router = router;
    },
    redirectToLogin() {
      if (this.router) {
        this.router.push("/login");
      } else {
        console.error("Router is not set in authStore");
      }
    },
  },
});
