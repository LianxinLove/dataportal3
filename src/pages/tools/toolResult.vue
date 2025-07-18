<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="peojectCard" :loading="loading">
          <div class="search">
            <v-text-field
              clearable
              density="compact"
              v-model="searchInput"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              single-line
              @input="searchMethod"
              style="flex: 1"
            ></v-text-field>
            <v-btn v-if="desserts.length" color="primary" @click="createProject"
              >Create</v-btn
            >
          </div>

          <v-data-table
            v-if="desserts.length"
            :headers="headers"
            :items="desserts"
            :items-per-page="-1"
            :loading="loading"
            fixed-header
            hide-default-footer
            height="700px"
            class="tabel"
          >
            <template v-slot:[`item.projectId`]="{ item }">
              <span>{{ item.projectId.toString().padStart(6, "0") }}</span>
            </template>
            <template v-slot:[`item.status`]="{ item }">
              <span v-if="item.status === 'success'">
                <v-icon
                  color="green-darken-2"
                  icon="mdi-check-circle-outline"
                  size="large"
                ></v-icon>
              </span>
              <span v-else-if="item.status === 'failed'">
                <v-icon
                  color="red-darken-2"
                  icon="mdi-alert-circle-outline"
                  size="large"
                ></v-icon>
              </span>
              <span v-else>
                <v-icon
                  color="orange-darken-2"
                  icon="mdi-clock-time-eight-outline"
                  size="large"
                ></v-icon>
              </span>
            </template>
            <template v-slot:[`item.operation`]="{ item }">
              <div class="buttonGroup">
                <v-tooltip text="Result Information" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-information-outline"
                      variant="text"
                      color="primary"
                      size="small"
                      v-bind="props"
                      @click="changePage(item, 'toolResultView')"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Download Result" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-download"
                      variant="text"
                      color="primary"
                      v-bind="props"
                      size="small"
                      @click="downloadResult(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Delete Information" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      color="error"
                      v-bind="props"
                      @click="deleteResult(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table>
          <v-alert
            v-if="desserts.length === 0 && !loading"
            type="warning"
            class="mt-4"
            dismissible
            :style="{ textAlign: 'center' }"
          >
            <p>No projects found. Please create a new project.</p>
            <v-btn class="mt-4" color="primary" @click="createProject"
              >Create</v-btn
            >
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

import { useRouter } from "vue-router";
import { toolsApi } from "@/api";

import { useSnackbarStore } from "@/stores/snackbar.js";
import { useConfirmDialog } from "@/stores/confirmDialog.js";
import { useToolStore } from "@/stores/tools";

// file-saver
import { saveAs } from "file-saver";

const snackbar = useSnackbarStore();
const confirmDialog = useConfirmDialog();
const toolStore = useToolStore();
// 搜索输入
const searchInput = ref("");
// 路由实例
const router = useRouter();
// table表头
const headers = [
  {
    align: "start",
    key: "id",
    title: "ID",
    width: "100px",
  },
  { key: "name", title: "Name" },
  { key: "create_datetime", title: "Create Date" },
  { key: "update_datetime", title: "Update Date" },
  { key: "status", title: "Status" },
  { key: "operation", title: "OPERATION", width: "300px" },
];
// 渲染数据
const desserts = ref([]);
// 原始数据
const sourceData = ref([]);
// loading状态
const loading = ref(true);
// 获取project列表
const getTeamplateWorkflowResult = async () => {
  try {
    const response = await toolsApi.getTeamplateWorkflowResult();
    sourceData.value = response;
    desserts.value = response;
    loading.value = false;
  } catch (error) {
    console.error("Error fetching project list:", error);
  }
};
// 本体搜索方法
const searchMethod = () => {
  if (searchInput.value !== "") {
    desserts.value = sourceData.value.filter((item) => {
      console.log(item.name);
      return (
        item.name.toUpperCase().indexOf(searchInput.value.toUpperCase()) !== -1
      );
    });
  } else {
    desserts.value = sourceData.value;
  }
};
// 删除
const deleteResult = async (item) => {
  const confirmed = await confirmDialog.openConfirmDialog({
    text: `Are you sure you want to delete ${item.name}?`,
  });
  if (confirmed) {
    try {
      await toolsApi.deleteToolResult(item.id);
      getTeamplateWorkflowResult();
      snackbar.openSnackbar({
        text: "Success",
        color: "success",
      });
    } catch {
    } finally {
    }
  } else {
    console.log("用户取消操作");
  }
};
const downloadResult = async (item) => {
  const response = await toolsApi.downloadResult(item.id);
  const blob = new Blob([response], { type: "application/zip" });
  saveAs(blob, item.id);
};
// 跳转页面
const changePage = (item, page) => {
  toolStore.setTool({
    tool: item,
  });
  // 跳转到对应页面
  router.push({
    path: "/tools/" + page,
  });
};
const createProject = () => {
  router.push({
    path: "/tools",
  });
};
getTeamplateWorkflowResult();
</script>

<style lang="less" scoped>
.peojectCard {
  padding: 8px;
}
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.buttonGroup {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tabel {
  :deep(.v-icon) {
    font-size: 24px !important;
  }
}
</style>