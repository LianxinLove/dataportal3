<template>
  <div>
    <v-app-bar app color="light" elevation="4" class="custom-app-bar" :type="navType">
      <v-toolbar-title class="custom-toolbar-title" style="color: #222;">iProteome</v-toolbar-title>
      <!-- <div class="nav-btns-left">
        <v-btn
          v-for="item in navItems"
          :key="item.title"
          text
          @click="selectNav(item)"
          :class="{ 'v-btn--active': selected === item.title }"
          style="color: #222;"
        >
          <v-icon left style="color: #222;">{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </div> -->
      <v-spacer></v-spacer>
      <v-btn icon @click="logoutDialog = true" class="ml-2" title="Logout" style="color: #222;">
        <v-icon style="color: #222;">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-dialog v-model="logoutDialog" max-width="360">
      <v-card>
        <v-card-title class="headline" style="color: #222;">Confirm Logout</v-card-title>
        <v-card-text style="color: #222;">Are you sure you want to logout?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="logoutDialog = false" style="color: #222;">Cancel</v-btn>
          <v-btn color="red" text @click="handleLogout">Logout</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>



<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const router = useRouter();

const navType = ref("left"); // 'top' 或 'left'
const navTypeSwitch = computed({
  get: () => navType.value === "top",
  set: (v) => (navType.value = v ? "top" : "left"),
});

const navItems = [
  { title: "Project", icon: "mdi-book", path: "/project" },
  { title: "Data", icon: "mdi-database", path: "/data" },
  { title: "Library", icon: "mdi-folder", path: "/library" },
  {
    title: "Analysis",
    icon: "mdi-chart-scatter-plot-hexbin",
    path: "/analysis",
  },
  { title: "Tools", icon: "mdi-tools", path: "/tools" },
  { title: "Results", icon: "mdi-resistor", path: "/results" },
];
const selected = ref(appStore.barSelected);

function selectNav(item) {
  selected.value = item.title;
  appStore.setSelect({
    barSelected: item.title,
  });
  router.push({
    path: item.path,
  });
}

const logoutDialog = ref(false);

const handleLogout = () => {
  localStorage.clear();
  logoutDialog.value = false;
  router.push({
    path: "/login",
    // 或使用命名路由（如果自动生成了名称）
    // name: 'project'
  });
};
</script>
<style lang="less" scoped>
.custom-toolbar-title {
  min-width: 120px;
  max-width: 180px;
  width: 150px;
  margin-right: 24px;
  color: #fff;
  letter-spacing: 2px;
}
.nav-btns-left {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 0;
}
.v-btn--active {
  background: rgba(125, 125, 125, 0.18) !important;
  color: #000000 !important;
}
.v-list-item--active {
  background: rgba(107, 107, 107, 0.18) !important;
  color: #000000 !important;
}
.v-app-bar,
.v-navigation-drawer {
  background: linear-gradient(90deg, #1976d2 0%, #1565c0 100%);
}
.v-btn,
.v-list-item {
  color: #e3f2fd;
}
.v-btn--active {
  background: rgba(255, 255, 255, 0.2);
}
.v-list-item--active {
  background: rgba(255, 255, 255, 0.2);
}
.nav-btns-center {
  display: flex;
  justify-content: center;
  flex: 1;
}
.v-btn--active {
  background: rgba(255, 255, 255, 0.2);
}
.v-list-item--active {
  background: rgba(255, 255, 255, 0.2);
}
.v-btn__content {
  display: flex;
  align-items: center;
  gap: 8px 0;
}
</style>
