<template>
  <v-app>
    <GlobalOverlay></GlobalOverlay>
    <GlobalSnackbar></GlobalSnackbar>
    <ConfirmDialog></ConfirmDialog>
    <router-view />
  </v-app>
</template>

<script setup>
import GlobalSnackbar from "@/components/GlobalSnackbar";
import GlobalOverlay from "@/components/GlobalOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
//
</script>
