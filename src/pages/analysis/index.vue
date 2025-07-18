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
            <v-btn v-if="desserts.length" color="primary" @click="navigateTo"
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
                <v-tooltip text="Analysis Result" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-information-outline"
                      variant="text"
                      color="primary"
                      size="small"
                      v-bind="props"
                      @click="changePage(item, 'analysisDetail')"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Workflow Modify" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      color="primary"
                      size="small"
                      v-bind="props"
                      @click="changePage(item, 'analysisModify')"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Download Result" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-download"
                      variant="text"
                      color="primary"
                      size="small"
                      v-bind="props"
                      @click="downloadAnalysis(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Delete Workflow" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      color="error"
                      v-bind="props"
                      @click="deleteAnalysis(item)"
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
            <v-btn class="mt-4" color="primary" @click="navigateTo"
              >Create</v-btn
            >
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      class="projectDrawer"
    >
      <h2>Project List</h2>
      <v-list>
        <template v-for="(item, index) in navItems" :key="index">
          <v-list-item
            :value="item.name"
            :title="item.name"
            @click="createAnalysis(item)"
          ></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

import { useRouter } from "vue-router";
import { analysisApi, projectApi } from "@/api";

import { useSnackbarStore } from "@/stores/snackbar.js";
import { useConfirmDialog } from "@/stores/confirmDialog.js";
import { useAnalysisStore } from "@/stores/analysis";

// file-saver
import { saveAs } from "file-saver";
const snackbar = useSnackbarStore();
const confirmDialog = useConfirmDialog();

const analysisStore = useAnalysisStore();
// 搜索输入
const searchInput = ref("");
// 路由实例
const router = useRouter();
// drawer状态
const drawer = ref(false);
// prject数据
const navItems = ref([]);
// table表头
const headers = [
  {
    align: "start",
    key: "id",
    title: "ID",
    width: "100px",
  },
  { key: "name", title: "Name" },
  { key: "createDate", title: "Create Date" },
  { key: "startDate", title: "Start Date" },
  { key: "endDate", title: "End Date" },
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
const getProjectList = async () => {
  try {
    const response = await projectApi.getProjectList();
    navItems.value = response.projects;
  } catch (error) {
    console.error("Error fetching project list:", error);
  }
};
// 获取analysis列表
const getAnalysisList = async () => {
  try {
    const response = await analysisApi.getAnalysisList();
    sourceData.value = response;
    desserts.value = response;
  } catch (error) {
    console.error("Error fetching project list:", error);
  } finally {
    loading.value = false;
  }
};
// 本体搜索方法
const searchMethod = () => {
  if (searchInput.value !== "") {
    desserts.value = sourceData.value.filter((item) => {
      return (
        item.name.toUpperCase().indexOf(searchInput.value.toUpperCase()) !== -1
      );
    });
  } else {
    desserts.value = sourceData.value;
  }
};
// download
const downloadAnalysis = async (item) => {
  loading.value = true;
  try {
    const response = await analysisApi.downloadAnalysis(
      item.id,
      item.project.id
    );
    const blob = new Blob([response], { type: "application/zip" });
    saveAs(blob, "workflow_" + item.name + "_" + item.id);
  } catch (error) {
  } finally {
    loading.value = false;
  }
};
// 删除分析
const deleteAnalysis = async (item) => {
  const confirmed = await confirmDialog.openConfirmDialog({
    text: `Are you sure you want to delete ${item.name}?`,
  });
  if (confirmed) {
    try {
      loading.value = true;
      await analysisApi.deleteAnalysis(item.id);
      getAnalysisList();
      snackbar.openSnackbar({
        text: "Success",
        color: "success",
      });
    } catch {
    } finally {
      loading.value = false;
    }
  } else {
    console.log("用户取消操作");
  }
};
// 跳转页面
const changePage = (item, page) => {
  console.log(item);
  analysisStore.setAnalysis({
    analysis: item,
  });
  // // 跳转到对应页面
  router.push({
    path: "/analysis/" + page,
  });
};
// 创建项目
const createAnalysis = (data) => {
  analysisStore.setProject({
    project: data,
  });
  router.push({
    path: "/analysis/analysisCreate",
  });
};
const navigateTo = () => {
  drawer.value = true;
};
getAnalysisList();
getProjectList();
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
.projectDrawer {
  padding: 16px;
}
</style>