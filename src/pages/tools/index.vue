<template>
  <v-container>
    <v-row>
      <div class="search"></div>
      <v-col v-for="tool in tools" :key="tool.name" cols="12" md="3">
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            :class="({ 'on-hover': isHovering }, 'card')"
            :elevation="isHovering ? 12 : 2"
            v-bind="props"
            @click="toolClick(tool)"
          >
            <v-card-title>
              {{ tool.name }}
            </v-card-title>
            <div class="leftText">
              <v-card-subtitle>
                {{ tool.label }}
              </v-card-subtitle>
              <img
                v-if="tool.example"
                :src="
                  `https://phenomics.fudan.edu.cn/firmiana/DP/static/example/` +
                  tool.example
                "
              />
              <div v-else>
                <v-empty-state
                  headline="No IMAGE Yet"
                  width="180"
                ></v-empty-state>
              </div>
              <v-card-text>
                {{ tool.description }}
              </v-card-text>
            </div>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

import { useRouter } from "vue-router";
import { toolsApi } from "@/api";

import { useToolStore } from "@/stores/tools";

const toolStore = useToolStore();
// 路由实例
const router = useRouter();
const tools = ref();

// 工具点击事件
const toolClick = (tool) => {
  toolStore.setTool({
    tool: tool,
  });
  // 跳转到工具详情页面
  router.push({
    path: "/tools/toolDetail",
  });
};
// 获取tools列表
const getCustomWorkflowList = async () => {
  try {
    const response = await toolsApi.getCustomWorkflow();
    tools.value = response;
  } catch (error) {
    console.error("Error fetching tools list:", error);
  }
};

getCustomWorkflowList();
</script>

<style lang="less" scoped>
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.v-card {
  height: 300px;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;


  .v-card-title {
    width: 100%;
  }
  .leftText {
    flex: 1;
    text-align: center;
    .v-card-subtitle{
      text-align: left;
    }
  }
  img {
    height: 200px;
  }
  :deep(.v-empty-state__headline) {
    font-size: 24px !important;
    background: #f5f5f5f5;
    padding: 20px;
  }
}
.v-card-subtitle {
  min-height: 40px;
}
.v-card-text {
  min-height: 60px;
}
// .v-card:not(.on-hover) {
//   opacity: 0.6;
// }
</style>