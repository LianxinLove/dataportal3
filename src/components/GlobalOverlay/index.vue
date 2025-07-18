<template>
  <v-overlay
    :model-value="store.show"
    :persistent="true"
    class="align-center justify-center"
  >
    <v-progress-circular
      color="primary"
      size="64"
      indeterminate
    ></v-progress-circular>
  </v-overlay>
</template>
<script setup>
import { ref, watch } from "vue";
import { useOverlayStore } from "@/stores/overlay";
const store = useOverlayStore();
</script>