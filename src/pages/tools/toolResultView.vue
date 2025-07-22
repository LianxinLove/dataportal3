<template>
  <v-container>
    <v-card>
      <v-btn variant="text" @click="$router.push('/tools/toolResult')">
        <v-icon style="color: #222">mdi-arrow-expand-left</v-icon>
        Back
      </v-btn>
    </v-card>
    <v-main class="mt-3">
      <v-row class="mt-3">
        <!-- 左侧工具表单 -->
        <v-col cols="12" md="5">
          <v-card>
            <v-card-title> {{ toolStore.tool.name }} </v-card-title>
            <v-card-text v-if="plotDataShow">
              <CustomForm
                :formData="parameters.subplots"
                :fileData="parameters.inputs"
                :formName="formName"
              ></CustomForm>
              <p class="submitBtn">
                <v-btn color="primary" @click="submit"> Submit </v-btn>
                <v-btn
                  prepend-icon="mdi-download"
                  density="default"
                  color="primary"
                  variant="text"
                  @click="save"
                  class="saveBtn"
                >
                  Download
                </v-btn>
              </p>
            </v-card-text>
          </v-card>
        </v-col>
        <!-- 右侧工具使用说明 -->
        <v-col cols="12" md="7">
          <v-card>
            <TableComponents
              v-if="type == 'table'"
              ref="TableRef"
              class="table"
              :items="data"
              :headers="tableColumns"
              @sort-changed="handleSortChange"
              @filter-changed="filterChange"
              :loading="tableLoading"
            >
            </TableComponents>
            <scatter
              v-if="plotDataShow && plotData.type == 'plotly'"
              :data="plotData"
            />
            <img
              v-if="plotDataShow && plotData.type == 'img'"
              :src="'data:image/png;base64,' + plotData.data"
              height="100%"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-container>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { analysisApi, projectApi, toolsApi } from "@/api";
import { useSnackbarStore } from "@/stores/snackbar.js";
const snackbar = useSnackbarStore();

import { useToolStore } from "@/stores/tools";
import { useOverlayStore } from "@/stores/overlay";
import TableComponents from "@/components/table/index.vue";
import scatter from "@/components/plot/scatter.vue";
// plot components
// file-saver
import { saveAs } from "file-saver";
const router = useRouter();

const toolStore = useToolStore();
const overlayStore = useOverlayStore();

const selectNodeData = ref({});
const TableRef = ref(null);
const tableLoading = ref(false);
const fileName = ref("");
const data = ref([]);
const tableColumns = ref([]);
const type = ref("");
const currentComponent = shallowRef(null);
const plotData = ref();
const plotType = ref();
const plotDataShow = ref(false);
const parameters = ref();
const formName = ref({ name: "" });

// 定义 plotType 与组件的映射关系
const componentMap = {
  line: defineAsyncComponent(() => import("../../components/plot/line.vue")),
  scatter: defineAsyncComponent(() =>
    import("../../components/plot/scatter.vue")
  ),
  PQDScatter: defineAsyncComponent(() =>
    import("../../components/plot/PQDScatter.vue")
  ),
  //   venn: defineAsyncComponent(() => import("../../components/plot/venn.vue")),
  heatMap: defineAsyncComponent(() =>
    import("../../components/plot/heatMap.vue")
  ),
  volcanoScatter: defineAsyncComponent(() =>
    import("../../components/plot/volcanoScatter.vue")
  ),
  bubble: defineAsyncComponent(() =>
    import("../../components/plot/bubble.vue")
  ),
};

const submit = async (data) => {
  // 提交表单数据

  try {
    overlayStore.openOverlay(true);
    const response = await toolsApi.updateTemplateWorkflow(toolStore.tool.id, {
      name: formName.value.name,
      inputs: parameters.value.inputs,
      subplots: parameters.value.subplots,
    });
    getToolResult();
    snackbar.openSnackbar({
      text: "Success",
      color: "success",
    });
    // router.push({
    //   path: "/tools/toolList",
    // });
    overlayStore.openOverlay(false);
  } catch (error) {
    overlayStore.openOverlay(false);
    console.error("提交失败:", error);
  }
  console.log("提交的数据:", data);
};

const save = async () => {
  const response = await toolsApi.downloadResult(toolStore.tool.id);
  const blob = new Blob([response], { type: "application/zip" });
  saveAs(blob, toolStore.tool.id);
};

const getToolResult = async () => {
  plotDataShow.value = false;
  try {
    const response = await toolsApi.getToolResult(toolStore.tool.id);
    plotData.value = response.result;
    plotType.value = response.result.data[0].type;
    parameters.value = response.parameters;
    formName.value.name = response.parameters.name;
    plotDataShow.value = true;
  } catch {}
};

const getTabeData = async () => {
  const form = {
    projectId: analysisStore.analysis.project.id,
    workflowId: analysisStore.analysis.id,
    nodeName: selectNodeData.value.fullName,
    file: false,
    start: 0,
    end: 10000,
    filename: fileName.value,
    all: false,
    filter_list: [],
    sort_list: [],
  };
  try {
    const response = await analysisApi.getAnalysisTableData(
      selectNodeData.value.id,
      form
    );
    response.colnames.forEach((element) => {
      tableColumns.value.push({
        value: element.value,
        title: element.title,
        type: "string",
        filterData: [{ data: "" }],
      });
    });
    data.value = response.result;
    type.value = "table";
    tableLoading.value = false;
  } catch {}
};

const filterChange = () => {};
const handleSortChange = (newSort) => {
  const { key, value: direction } = newSort;

  return data.value.sort((a, b) => {
    // 处理空值（undefined/null 置后）
    if (a[key] == null) return 1;
    if (b[key] == null) return -1;

    // 数字类型排序
    if (typeof a[key] === "number" && typeof b[key] === "number") {
      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    }

    // 字符串类型排序
    const compareResult = String(a[key]).localeCompare(String(b[key]));
    return direction === "asc" ? compareResult : -compareResult;
  });
};
onMounted(() => {
  getToolResult();
});
watch(
  plotType,
  (newType) => {
    currentComponent.value = componentMap[newType];
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.v-main {
  padding: 12px;
  background-color: #fff !important;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.selectNodeName {
  text-align: center;
  position: relative;
  .saveBtn {
    position: absolute;
    right: 30px;
    top: -3px;
  }
}
.FAGLHeader {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  height: 60px;
  .v-switch {
    height: 60px;
    margin-right: 30px;
  }
  .btnGroup {
    height: 60px;
    display: flex;
    align-items: center;
  }
}
/* Add your custom styles here if needed */
</style>