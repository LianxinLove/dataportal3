<template>
  <v-main class="default-layout">
    <content></content>
    <bar></bar>
    <router-view />
  </v-main>
  <!-- <AppFooter /> -->
</template>

<script setup>
//
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("Layout HMR Triggered!");
  });
}
</script>
<style lang="less" scoped>
.default-layout {
  background: #f5f5f5;
}
</style>
