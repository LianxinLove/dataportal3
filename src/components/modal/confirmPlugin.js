import { createApp, h, ref } from "vue";
import ConfirmDialog from "./ConfirmDialog.vue";

export default {
  install(app) {
    // 检查是否已安装
    if (app.config.globalProperties.$confirm) return;

    // 创建挂载点
    const mountPoint = document.createElement("div");
    document.body.appendChild(mountPoint);

    // 创建组件实例引用
    let componentInstance = ref(null);

    // 创建独立应用
    const confirmApp = createApp({
      render() {
        return h(ConfirmDialog, {
          ref: (el) => (componentInstance.value = el),
        });
      },
    });

    // 挂载应用
    confirmApp.mount(mountPoint);

    // 添加全局方法
    app.config.globalProperties.$confirm = (options) => {
      if (!componentInstance.value) {
        console.error("确认框组件未初始化");
        return Promise.reject("组件未就绪");
      }
      return componentInstance.value.open(options);
    };

    // 提供注入方法
    app.provide("confirm", app.config.globalProperties.$confirm);
  },
};
