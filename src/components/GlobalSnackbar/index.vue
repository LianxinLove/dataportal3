<template>
  <v-snackbar
    class="snackbar"
    v-model="store.show"
    :color="store.color"
    :timeout="3000"
    location="top center"
  >
    {{ store.message }}
  </v-snackbar>
</template>

<script setup>
import { useSnackbarStore } from "@/stores/snackbar";
const store = useSnackbarStore();
</script>
<style lang="scss" scoped>
.snackbar {
  :deep(.v-overlay__content) {
    left: 50% !important;
    transform: translateX(-50%) !important;
    right: unset;
    top: 20px; /* 保持顶部位置 */
    width: auto !important; /* 宽度自适应 */
    min-width: 200px; /* 最小宽度 */
    max-width: 80%; /* 避免过宽 */
  }
}
</style>