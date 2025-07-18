import { ref } from "vue";

export default {
  setup() {
    const isVisible = ref(false);
    const title = ref("确认操作");
    const message = ref("确定要执行此操作吗？");
    const confirmText = ref("确定");
    const cancelText = ref("取消");
    const isDanger = ref(false);
    const needVerification = ref(false);
    const verification = ref("");

    let resolvePromise = () => {};

    const open = (options = {}) => {
      title.value = options.title || "确认操作";
      message.value = options.message || "确定要执行此操作吗？";
      confirmText.value = options.confirmText || "确定";
      cancelText.value = options.cancelText || "取消";
      isDanger.value = options.danger || false;
      needVerification.value = options.needVerification || false;
      verification.value = "";
      isVisible.value = true;

      return new Promise((resolve) => {
        resolvePromise = resolve;
      });
    };

    const confirm = () => {
      if (needVerification.value && verification.value !== "DELETE") {
        return;
      }
      resolvePromise(true);
      isVisible.value = false;
    };

    const cancel = () => {
      resolvePromise(false);
      isVisible.value = false;
    };

    return {
      isVisible,
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      needVerification,
      verification,
      open,
      confirm,
      cancel,
    };
  },
  template: `
    <v-dialog v-model="isVisible" persistent max-width="500px">
      <v-card :class="{ 'danger-action': isDanger }">
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text>
          <p>{{ message }}</p>
          <v-text-field 
            v-if="needVerification"
            v-model="verification"
            label="请输入DELETE以确认"
            :rules="[v => v === 'DELETE' || '输入内容不匹配']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="cancel">{{ cancelText }}</v-btn>
          <v-btn color="primary" @click="confirm">{{ confirmText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  style: `
    .danger-action {
      border-left: 4px solid #ff5252;
    }
    .danger-action .v-card__title {
      color: #ff5252;
    }
  `,
};
