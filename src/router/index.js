import { createRouter, createWebHashHistory } from "vue-router";
//@ts-ignore
import { setupLayouts } from "virtual:generated-layouts"; //将route里面的路由变成嵌套路由
//@ts-ignore
import generatedRoutes from "~pages";
const routes = setupLayouts([
  ...generatedRoutes,
  {
    path: "/",
    redirect: "/project",
    component: () => import("@/pages/project/index.vue"), // 首页组件
  },
]);
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
});
router.isReady().then(() => {
  // localStorage.removeItem("vuetify:dynamic-reload");
});
export default router;
