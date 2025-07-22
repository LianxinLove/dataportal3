<template>
  <v-container fluid>
    <v-card>
      <v-btn variant="text" @click="$router.push('/tools')">
        <v-icon style="color: #222">mdi-arrow-expand-left</v-icon>
        Back
      </v-btn>
    </v-card>
    <v-row class="mt-3">
      <!-- 左侧工具表单 -->
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title> {{ toolStore.tool.name }} </v-card-title>
          <v-card-text>
            <CustomForm
              :formData="formData"
              :fileData="fileData"
              :formName="formName"
            ></CustomForm>
            <p class="submitBtn">
              <v-btn color="primary" @click="submit"> Submit </v-btn>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- 右侧工具使用说明 -->
      <v-col cols="12" md="7">
        <v-card>
          <v-card-title> 工具使用说明 </v-card-title>
          <v-card-text>
            <div></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

import { useToolStore } from "@/stores/tools";
import { toolsApi } from "@/api";
import { useRouter } from "vue-router";

import CustomForm from "@/components/customForm/index.vue";

import { useSnackbarStore } from "@/stores/snackbar.js";
import { useOverlayStore } from "@/stores/overlay";
const overlayStore = useOverlayStore();
const snackbar = useSnackbarStore();

// 路由实例
const router = useRouter();
const toolStore = useToolStore();

const formData = ref([]);
const fileData = ref([]);
const formName = ref({ name: "" });

// 根据id获取工具配置
const getCustomWorkflowDetailMethod = async () => {
  try {
    const response = await toolsApi.getCustomWorkflowDetail(toolStore.tool.id);
    formData.value = response.subplots[0].params;
    fileData.value = response.inputs;
    formName.value.name = response.name;
  } catch (error) {
    console.error("Error fetching tool details:", error);
  }
};
const checkFile = () => {
  let fileStatus = true;
  formData.value.forEach((item) => {
    if (!item.optional && !item.params && item.type == "upload_files") {
      snackbar.openSnackbar({
        text: `${item.file.split(".")[0]} is not optional, but not selected.`,
        color: "warning",
      });
      fileStatus = false;
      return;
    }
  });
  return fileStatus;
};
const submit = async (data) => {
  // 提交表单数据
  if (checkFile()) {
    try {
      overlayStore.openOverlay(true);
      const response = await toolsApi.createTemplateWorkflow({
        name: formName.value.name,
        // inputs: fileData.value,
        subplots: formData.value,
        id: toolStore.tool.id,
      });
      overlayStore.openOverlay(false);
      snackbar.openSnackbar({
        text: "Success",
        color: "success",
      });
      router.push({
        path: "/tools/toolResult",
      });
    } catch (error) {
      overlayStore.openOverlay(false);
      console.error("提交失败:", error);
    }
  }
  overlayStore.openOverlay(false);
  console.log("提交的数据:", data);
};
getCustomWorkflowDetailMethod();
</script>
<style lang="less" scoped>
.submitBtn {
  padding-left: 16px;
}
</style>