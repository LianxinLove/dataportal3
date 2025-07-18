/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Styles
import "unfonts.css";

import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useAuthStore } from "@/stores/auth";
import router from "./router";
// import confirmDialog from "./components/modal/confirmDialog";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

registerPlugins(app);

app.use(pinia).use(router);
const authStore = useAuthStore();
authStore.setRouter(router);

app.mount("#app");
