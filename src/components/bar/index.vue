<template>
  <v-navigation-drawer app permanent>
    <v-list
      density="compact"
      nav
      v-model:active="activeItem"
      mandatory
      v-model:opened="open"
    >
      <template v-for="(item, index) in navItems" :key="index">
        <v-list-item
          v-if="!item.children"
          :value="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="navigateTo(item)"
          :class="{ 'v-list-item--active': activeItem === item.title }"
        ></v-list-item>

        <v-list-group :value="item.title" v-else>
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="item.title"
              :prepend-icon="item.icon"
              :class="{ 'v-list-item--active': activeItem === item.title }"
            ></v-list-item>
          </template>

          <v-list-item
            v-for="(data, i) in item.children"
            :key="i"
            :prepend-icon="data.icon"
            :title="data.title"
            :value="data.title"
            @click="navigateTo(data)"
            :class="{ 'v-list-item--active': activeItem === data.title }"
          ></v-list-item>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// 导航数据（单层结构）
const navItems = [
  { title: "Project", icon: "mdi-book", path: "/project" },
  { title: "Data", icon: "mdi-folder", path: "/data" },
  {
    title: "Tool",
    icon: "mdi-tools",
    children: [
      {
        title: "Tool List",
        icon: "mdi-view-list",
        path: "/tools",
        open: "Tool",
      },
      {
        title: "Tool Results",
        icon: "mdi-file-document",
        path: "/tools/toolResult",
        open: "Tool",
      },
    ],
  },
  {
    title: "Workflow",
    icon: "mdi-chart-scatter-plot-hexbin",
    path: "/analysis",
  },
  // { title: "Result", icon: "mdi-resistor", path: "/result" },
];

// 核心修复 1：统一使用 title 作为激活标识
const activeItem = ref("");
const open = ref([""]);

// 核心修复 2：根据路由自动设置激活项
const syncActiveState = () => {
  // 优先级：当前路由匹配 > Store 存储 > 默认值
  const routeItem = navItems.find((item) => route.path.startsWith(item.path));
  activeItem.value = routeItem?.title || appStore.barSelected || "Project";
};

// 核心修复 3：监听路由变化（子页面跳转时触发）
watch(() => route.path, syncActiveState, { immediate: true });

// 导航函数
const navigateTo = (item) => {
  activeItem.value = item.title;
  appStore.setSelect({
    barSelected: item.title,
    barOpened: item.open || [""],
  }); // 存储 title
  if (route.path !== item.path) {
    router.push(item.path);
  }
};

// 初始化时从 Store 加载（可选）
onMounted(() => {
  if (!activeItem.value) {
    activeItem.value = appStore.barSelected || "Project";
  }
  open.value = appStore.barOpened || [""];
});
</script>

<style lang="less" scoped>
/* 可根据需要自定义样式 */
:deep(.v-list-item__content) {
  display: flex;
  gap: 10px;
}
.v-list-item--active {
  color: #1867c0 !important; /* Vuetify 主色 */
  background-color: #e3f2fd !important;
}
</style>