<template>
  <v-dialog v-model="store.show" max-width="600" persistent>
    <v-card>
      <v-card-title class="headline">Confirm</v-card-title>
      <v-card-text>{{ store.message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="handleAction(false)">Cancel</v-btn>
        <v-btn color="red" text @click="handleAction(true)">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useConfirmDialog } from "@/stores/confirmDialog";

const store = useConfirmDialog();

// 统一处理用户操作
const handleAction = (confirmed) => {
  store.handleUserChoice(confirmed);
};
</script>