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
            max-height="700px"
            :headers="headers"
            :items="desserts"
            :items-per-page="-1"
            :loading="loading"
            fixed-header
            hide-default-footer
          >
            <template v-slot:[`item.projectId`]="{ item }">
              <span>{{ item.projectId.toString().padStart(6, "0") }}</span>
            </template>
            <template v-slot:[`item.operation`]="{ item }">
              <div class="buttonGroup">
                <v-tooltip text="Project Information" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-information-outline"
                      variant="text"
                      color="primary"
                      size="small"
                      v-bind="props"
                      @click="changePage(item, 'projectinfo')"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Create Analysis" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-sitemap"
                      variant="text"
                      color="primary"
                      size="small"
                      v-bind="props"
                      @click="analysisCreate(item, 'analysisCreate')"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Share Project" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-share"
                      variant="text"
                      color="primary"
                      size="small"
                      v-bind="props"
                      @click="
                        (shareProjectDialog = true),
                          (projectID = item.projectId)
                      "
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Delete Project" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      color="error"
                      v-bind="props"
                      @click="deleteProject(item)"
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
  <v-dialog v-model="shareProjectDialog" width="600" height="300">
    <v-card title="Share Project" class="pa-4">
      <v-form @submit.prevent>
        <v-text-field
          variant="outlined"
          v-model="email"
          :rules="
            (value) => {
              if (value) return true;
              return 'You must enter a Email.';
            }
          "
          type="email"
          label="Email"
        ></v-text-field>
        <v-btn
          class="mt-2"
          type="submit"
          color="primary"
          block
          @click="shareProject"
          >Submit</v-btn
        >
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";

import { useRouter } from "vue-router";
import { projectApi } from "@/api";

import { useProjectStore } from "@/stores/project";
import { useAnalysisStore } from "@/stores/analysis";
import { useSnackbarStore } from "@/stores/snackbar.js";
import { useConfirmDialog } from "@/stores/confirmDialog.js";

const snackbar = useSnackbarStore();
const confirmDialog = useConfirmDialog();

const analysisStore = useAnalysisStore();
const projectStore = useProjectStore();
// 搜索输入
const searchInput = ref("");
// 路由实例
const router = useRouter();
// table表头
const headers = [
  {
    align: "start",
    key: "projectId",
    title: "id",
    width: "200px",
  },
  { key: "name", title: "Name", width: "400px" },
  { key: "description", title: "Description" },
  { key: "operation", title: "OPERATION", width: "300px" },
];
// 渲染数据
const desserts = ref([]);
// 原始数据
const sourceData = ref([]);
// loading状态
const loading = ref(true);
// 分享
const shareProjectDialog = ref(false);
const email = ref("");
const projectID = ref("");
// 获取project列表
const getProjectList = async () => {
  try {
    const response = await projectApi.getProjectList();
    sourceData.value = response.projects;
    desserts.value = response.projects;
    loading.value = false;
  } catch (error) {
    console.error("Error fetching project list:", error);
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
// 跳转页面
const changePage = (item, page) => {
  projectStore.setProject({
    project: item,
  });
  // 跳转到对应页面
  router.push({
    path: "/project/" + page,
  });
};
// 分享
const shareProject = async () => {
  try {
    const response = await projectApi.shareProject(projectID.value, {
      email: email.value,
    });
    shareProjectDialog.value = false;
    snackbar.openSnackbar({
      text: "Success",
      color: "success",
    });
  } catch {}
};
// 删除
const deleteProject = async (data) => {
  const confirmed = await confirmDialog.openConfirmDialog({
    text: `Are you sure you want to delete ${data.name}?`,
  });
  if (confirmed) {
    console.log(data);
    try {
      await projectApi.deleteProject(data.projectId);
      getProjectList();
      snackbar.openSnackbar({
        text: "Success",
        color: "success",
      });
    } catch {}
  } else {
    console.log("用户取消操作");
  }
};
const analysisCreate = (item, page) => {
  analysisStore.setProject({
    project: item,
  });
  // 跳转到对应页面
  router.push({
    path: "/analysis/" + page,
  });
};
const createProject = () => {
  router.push({
    path: "/project/projectCreate",
  });
};
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
  gap: 8px;
}
</style>