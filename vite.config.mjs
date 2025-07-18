// Plugins
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Fonts from "unplugin-fonts/vite";
import Layouts from "vite-plugin-vue-layouts-next";
import Pages from "vite-plugin-pages";
import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import path from 'path';

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    VueRouter({
      routesFolder: "src/pages", // 与 Pages 插件目录一致
    }),
    Layouts({
      layoutsDir: "src/layouts", // 明确指定布局目录
      defaultLayout: "DefaultLayout", // 默认布局组件名称
    }),
    Pages({
      dirs: "./src/pages", // 所有视图目录，我这里是view，按照自己的项目结构配置
      extendRoute(route) {
        if (route.path === "/") {
          return {
            ...route,
            // 重定向到指定页面（例如 '/home'）
            redirect: "/project",
          };
        }
        return route;
      },
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
    Components({
      dirs: ["src/components"], // 组件目录
    }),
    Fonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
    AutoImport({
      imports: [
        "vue",
        VueRouterAutoImports,
        {
          pinia: ["defineStore", "storeToRefs"],
        },
      ],
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
  ],
  optimizeDeps: {
    exclude: [
      "vuetify",
      "vue-router",
      "unplugin-vue-router/runtime",
      "unplugin-vue-router/data-loaders",
      "unplugin-vue-router/data-loaders/basic",
      "dagre-d3",
    ],
  },
  build: {
    rollupOptions: {
      external: [
        // 添加以下内容 ↓
        // "@vue-flow/core",
        // "@vue-flow/additional-components", // 如果用到其他子模块
      ],
    },
  },
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@vue-flow/core": fileURLToPath(new URL('./node_modules/@vue-flow/core', import.meta.url)), // 显式指定路径
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler",
      },
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
